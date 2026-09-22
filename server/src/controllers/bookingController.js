import { Booking } from '../models/Booking.js';

// TODO: write a validation schema for create/update per README.md section 2.

async function hasBookingConflict({ roomNumber, startDate, endDate, excludeId }) {
  const query = {
    roomNumber,
    startDate: { $lt: endDate },
    endDate: { $gt: startDate }
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Booking.exists(query);
}

// GET /api/bookings
// TODO: implement per README.md section 3.
export async function getAllBookings(req, res, next) {
  try {
    //get all bookings from the database
    const bookings = await Booking.find().populate('bookedBy', 'name email');
    res.json(bookings);

  } catch (err) { next(err); }
}

// GET /api/bookings/:id
// TODO: implement per README.md sections 3 and 5.
export async function getBooking(req, res, next) {
  try {
    // if not found, return 404

    const booking = await Booking.findById(req.params.id).populate('bookedBy', 'name email');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
    
  } catch (err) { next(err); }
}

// POST /api/bookings
// TODO: implement per README.md sections 3 and 4.
export async function createBooking(req, res, next) {
  try {
    const { roomNumber, startDate, endDate } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!roomNumber || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({ message: 'startDate must be before endDate and roomNumber is required' });
    }

    if (await hasBookingConflict({ roomNumber, startDate: start, endDate: end })) {
      return res.status(409).json({ message: 'Booking conflict with existing booking' });
    }

    res.status(201).json(await Booking.create(req.body));
  } catch (err) { next(err); }
}

// PATCH /api/bookings/:id
// TODO: implement per README.md sections 3, 4, and 5.
export async function updateBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const updatedBooking = { ...booking.toObject(), ...req.body };
    const start = new Date(updatedBooking.startDate);
    const end = new Date(updatedBooking.endDate);

    if (!updatedBooking.roomNumber || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({ message: 'startDate must be before endDate and roomNumber is required' });
    }

    if (await hasBookingConflict({
      roomNumber: updatedBooking.roomNumber,
      startDate: start,
      endDate: end,
      excludeId: booking._id
    })) {
      return res.status(409).json({ message: 'Booking conflict with existing booking' });
    }

    booking.set(req.body);
    await booking.save();
    await booking.populate('bookedBy', 'name email');
    res.json(booking);
  } catch (err) { next(err); }
}

// DELETE /api/bookings/:id
// TODO: implement per README.md sections 3 and 5.
export async function deleteBooking(req, res, next) {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });

  } catch (err) { next(err); }
}
