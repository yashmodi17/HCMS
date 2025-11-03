import {
  HealthRecord,
  Vaccination,
  User,
  Notification,
  Child
} from "../models/index.js";

// Get all aanganwadis for volunteer doctors to see
export const getAanganwadis = async (req, res) => {
  try {
    const aanganwadis = await User.aggregate([
      { $match: { role: "aanganwadi_staff" } },
      {
        $group: {
          _id: "$aanganwadiCode",
          aanganwadiName: { $first: "$aanganwadiName" },
          aanganwadiAddress: { $first: "$aanganwadiAddress" },
          staffCount: { $sum: 1 },
          staffMembers: {
            $push: {
              id: "$_id",
              name: "$name",
              email: "$email",
              phone: "$phone"
            }
          }
        }
      },
      { $sort: { aanganwadiName: 1 } }
    ]);

    // Get child count for each aanganwadi
    const aanganwadiCodes = aanganwadis.map(a => a._id);
    const childCounts = await Child.aggregate([
      { $match: { aanganwadiCode: { $in: aanganwadiCodes }, isActive: true } },
      {
        $group: {
          _id: "$aanganwadiCode",
          childCount: { $sum: 1 }
        }
      }
    ]);

    // Combine the data
    const aanganwadiData = aanganwadis.map(aanganwadi => {
      const childData = childCounts.find(c => c._id === aanganwadi._id);
      return {
        ...aanganwadi,
        childCount: childData ? childData.childCount : 0
      };
    });

    res.status(200).json(aanganwadiData);
  } catch (error) {
    console.error('Error fetching aanganwadis:', error);
    res.status(500).json({ message: 'Failed to fetch aanganwadis' });
  }
};

// Get children for a specific aanganwadi (for volunteer doctors)
export const getAanganwadiChildren = async (req, res) => {
  try {
    const { aanganwadiCode } = req.params;
    
    const children = await Child.find({ 
      aanganwadiCode, 
      isActive: true 
    })
    .populate('healthRecords')
    .populate('vaccinationRecords')
    .populate('aanganwadiStaff', 'name email phone')
    .sort({ name: 1 });

    res.status(200).json(children);
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ message: 'Failed to fetch children' });
  }
};

// Get detailed child health data for doctors
export const getChildHealthDetails = async (req, res) => {
  try {
    const { childId } = req.params;
    
    const child = await Child.findById(childId)
      .populate({
        path: 'healthRecords',
        populate: { path: 'recordedBy', select: 'name role' }
      })
      .populate({
        path: 'vaccinationRecords',
        populate: { path: 'recordedBy', select: 'name role' }
      })
      .populate('aanganwadiStaff', 'name email phone aanganwadiName');

    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    res.status(200).json(child);
  } catch (error) {
    console.error('Error fetching child health details:', error);
    res.status(500).json({ message: 'Failed to fetch child details' });
  }
};

// Add health record for a child (volunteer doctors)
export const addChildHealthRecord = async (req, res) => {
  try {
    const { childId } = req.params;
    const {
      diagnosis,
      treatment,
      prescription,
      notes
    } = req.body;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can add health records' });
    }

    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    const healthRecord = new HealthRecord({
      childId,
      recordedBy: req.user.id,
      doctorId: req.user.id,
      diagnosis,
      treatment,
      prescription,
      notes,
      isManualUpload: false
    });

    await healthRecord.save();

    // Add to child's health records
    child.healthRecords.push(healthRecord._id);
    await child.save();

    // Notify aanganwadi staff
    const notification = new Notification({
      recipientId: child.aanganwadiStaff,
      type: 'health',
      message: `New health record added for ${child.name} by Dr. ${req.user.name}`,
      relatedData: {
        childId: child._id,
        healthRecordId: healthRecord._id
      }
    });
    await notification.save();

    res.status(201).json({
      message: 'Health record added successfully',
      healthRecord
    });
  } catch (error) {
    console.error('Error adding health record:', error);
    res.status(500).json({ message: 'Failed to add health record' });
  }
};

// Update doctor volunteer status
export const updateVolunteerStatus = async (req, res) => {
  try {
    const { isVolunteer } = req.body;
    
    const doctor = await User.findByIdAndUpdate(
      req.user.id,
      { isVolunteer },
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: 'Volunteer status updated successfully',
      doctor
    });
  } catch (error) {
    console.error('Error updating volunteer status:', error);
    res.status(500).json({ message: 'Failed to update volunteer status' });
  }
};

// Get volunteer doctors
export const getVolunteerDoctors = async (req, res) => {
  try {
    const volunteers = await User.find({
      role: 'doctor',
      isVolunteer: true
    }).select('name email specialization phone');

    res.status(200).json(volunteers);
  } catch (error) {
    console.error('Error fetching volunteer doctors:', error);
    res.status(500).json({ message: 'Failed to fetch volunteer doctors' });
  }
};