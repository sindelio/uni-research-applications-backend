import {
  Admin,
  Participant,
  Examiner,
  Project,
} from '../../../database/models.js';
import exists from '../../../helpers/exists.js';
import BadRequest from '../../../errors/bad-request.js';

async function getModel(model) {
  let Model = undefined;
  if (model == 'Admin') {
    Model = Admin;
  }
  if (model == 'Participant') {
    Model = Participant;
  }
  if (model == 'Examiner') {
    Model = Examiner;
  }
  if (model == 'Project') {
    Model = Project;
  }
  if (!exists(Model)) {
    throw new BadRequest('Model is undefined');
  }
  return Model;
}

export default getModel;