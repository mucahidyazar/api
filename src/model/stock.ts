import mongoose from 'mongoose'
// const validator = require("validator");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

const stockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
    retry: {
      type: Number,
      required: true,
      default: 100,
      min: 0,
    },
    results: [{}],
  },
  {
    timestamps: true,
  },
)

const mystockSchema = new mongoose.Schema({
  active: {
    type: Boolean,
    required: true,
  },
  retry: {
    type: Number,
    required: true,
  },
  results: [{}],
})

const Stock = mongoose.model('Stock', stockSchema)
const MyStock = mongoose.model('MyStock', mystockSchema)

export { MyStock, Stock }
