/* eslint-disable no-use-before-define */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');

const IssuerSchema = new mongoose.Schema({
  did: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageId: {
    type: String,
  },
  blockHash: {
    type: String,
    required: true,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  expireOn: {
    type: Date,
    required: true,
  },
  createdOn: {
    type: Date,
    default: new Date(),
  },
  modifiedOn: {
    type: Date,
  },
});

IssuerSchema.pre('findOneAndUpdate', function pre(next) {
  this.update({}, { modifiedOn: new Date() });
  next();
});

IssuerSchema.methods.delete = async function delet() {
  const updateQuery = { _id: this._id };
  const updateAction = {
    $set: { deleted: true },
  };

  try {
    await Issuer.findOneAndUpdate(updateQuery, updateAction);
    this.deleted = true;
    return Promise.resolve(this);
  } catch (err) {
    return Promise.reject(err);
  }
};

IssuerSchema.methods.edit = async function edit(data) {
  const { name, description } = data;
  try {
    return await Issuer.findByIdAndUpdate(
      { _id: this._id },
      { name, description },
      { new: true },
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    return Promise.reject(err);
  }
};

IssuerSchema.methods.updateImage = async function updateImage(imageId) {
  try {
    return await Issuer.findByIdAndUpdate({ _id: this._id }, { imageId }, { new: true });
  } catch (err) {
    return Promise.reject(err);
  }
};

const Issuer = mongoose.model('Issuer', IssuerSchema);
module.exports = Issuer;

Issuer.getAll = async function getAll(limit, page) {
  return Issuer.find({
    deleted: false,
  },
  {
    did: 1, name: 1, description: 1, imageId: 1,
  })
    .sort({ name: 1 })
    .skip(page > 0 ? ((page - 1) * limit) : 0)
    .limit(limit);
};

Issuer.getByDID = async function getByDID(did) {
  return Issuer.findOne({ did });
};

Issuer.getByName = async function getByName(name) {
  return Issuer.findOne({ name });
};
