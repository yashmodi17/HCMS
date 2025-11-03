import { Donation, User } from '../models/index.js';

// Create a new donation
export const createDonation = async (req, res) => {
  try {
    const {
      donorName,
      donorEmail,
      donorPhone,
      donorAddress,
      donationType,
      amount,
      paymentMethod,
      transactionId,
      itemDescription,
      quantity,
      condition
    } = req.body;

    const donation = new Donation({
      donorName,
      donorEmail,
      donorPhone,
      donorAddress,
      donationType,
      amount,
      paymentMethod,
      transactionId,
      itemDescription,
      quantity,
      condition,
      status: 'received'
    });

    await donation.save();
    
    res.status(201).json({
      message: 'Donation received successfully',
      donation
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ message: 'Failed to create donation' });
  }
};

// Get all donations (for coordinators)
export const getAllDonations = async (req, res) => {
  try {
    const { status, donationType } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (donationType) filter.donationType = donationType;

    const donations = await Donation.find(filter)
      .populate('verifiedBy', 'name')
      .populate('distributedTo.coordinatorId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ message: 'Failed to fetch donations' });
  }
};

// Get donation by ID
export const getDonationById = async (req, res) => {
  try {
    const { donationId } = req.params;
    
    const donation = await Donation.findById(donationId)
      .populate('verifiedBy', 'name email')
      .populate('distributedTo.coordinatorId', 'name email');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.status(200).json(donation);
  } catch (error) {
    console.error('Error fetching donation:', error);
    res.status(500).json({ message: 'Failed to fetch donation' });
  }
};

// Verify donation (coordinators only)
export const verifyDonation = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { notes } = req.body;

    if (req.user.role !== 'coordinator') {
      return res.status(403).json({ message: 'Only coordinators can verify donations' });
    }

    const donation = await Donation.findByIdAndUpdate(
      donationId,
      {
        status: 'verified',
        verifiedBy: req.user.id,
        verificationDate: new Date(),
        notes
      },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.status(200).json({
      message: 'Donation verified successfully',
      donation
    });
  } catch (error) {
    console.error('Error verifying donation:', error);
    res.status(500).json({ message: 'Failed to verify donation' });
  }
};

// Distribute donation to aanganwadi
export const distributeDonation = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { aanganwadiCode, aanganwadiName } = req.body;

    if (req.user.role !== 'coordinator') {
      return res.status(403).json({ message: 'Only coordinators can distribute donations' });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'verified') {
      return res.status(400).json({ message: 'Donation must be verified before distribution' });
    }

    donation.status = 'distributed';
    donation.distributedTo = {
      aanganwadiCode,
      aanganwadiName,
      coordinatorId: req.user.id,
      distributionDate: new Date()
    };

    await donation.save();

    res.status(200).json({
      message: 'Donation distributed successfully',
      donation
    });
  } catch (error) {
    console.error('Error distributing donation:', error);
    res.status(500).json({ message: 'Failed to distribute donation' });
  }
};

// Get donations for a specific aanganwadi
export const getDonationsByAanganwadi = async (req, res) => {
  try {
    const { aanganwadiCode } = req.params;
    
    const donations = await Donation.find({
      'distributedTo.aanganwadiCode': aanganwadiCode,
      status: 'distributed'
    })
    .populate('distributedTo.coordinatorId', 'name')
    .sort({ 'distributedTo.distributionDate': -1 });

    res.status(200).json(donations);
  } catch (error) {
    console.error('Error fetching aanganwadi donations:', error);
    res.status(500).json({ message: 'Failed to fetch donations' });
  }
};

// Get donation statistics
export const getDonationStats = async (req, res) => {
  try {
    const stats = await Donation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { 
            $sum: { 
              $cond: [{ $eq: ['$donationType', 'money'] }, '$amount', 0] 
            } 
          }
        }
      }
    ]);

    const typeStats = await Donation.aggregate([
      {
        $group: {
          _id: '$donationType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      statusStats: stats,
      typeStats: typeStats
    });
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    res.status(500).json({ message: 'Failed to fetch donation statistics' });
  }
};