import {
  Admin,
  Participant,
  Examiner,
} from '../../../database/models.js';

async function getModel(model) {
  let Model = Admin;
  if (model == 'Participant') {
    Model = Participant;
  }
  if (model == 'Examiner') {
    Model = Examiner;
  }
  return Model;
}

export default getModel;