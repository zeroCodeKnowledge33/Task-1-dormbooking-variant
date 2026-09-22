import { Booking } from '../models/Booking.js';

// TODO: write a validation schema for create/update per README.md section 2.

// TODO: per README.md section 4, you will need a way to detect whether a
// proposed booking conflicts with an existing one on the same room.

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
    if( req.body.startDate >= req.body.endDate){
      res.status(409).json({message : "start date should be less than end date"})
    }
    
    const bookings = await Booking.find({
      roomNumber: req.body.roomNumber,
      startDate: { $lt: req.body.endDate },
      endDate: { $gt: req.body.startDate }
    });
    if (bookings.length > 0) {
      return res.status(400).json({ message: "Booking conflict with existing booking" });
    }
    res.status(201).json(await Booking.create(req.body));

    
  } catch (err) { next(err); }
}

// PATCH /api/bookings/:id
// TODO: implement per README.md sections 3, 4, and 5.
export async function updateBooking(req, res, next) {
  try {
    if( req.body.startDate >= req.body.endDate){
      res.status(409).json({message : "start date should be less than end date"})
    }
    const bookings = await Booking.find({
      roomNumber: req.body.roomNumber,
      startDate: { $lt: req.body.endDate },
      endDate: { $gt: req.body.startDate }
    });
    if (bookings.length > 0) {
      return res.status(400).json({ message: "Booking conflict with existing booking" });
    }
    res.json(await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true }));
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
