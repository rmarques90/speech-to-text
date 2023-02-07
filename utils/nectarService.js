import axios from 'axios';
import logger from '../Logging';

export default class NectarService {
  constructor(props) {
    this.masterUserId = props.masterUserId;
    this.nectarBackofficeHost = process.env.NECTAR_BACKOFFICE_HOST || 'http://localhost:4567/backoffice';
  }

  async hasTranscriptionFunctionality() {
    try {
      return await axios.get(`${this.nectarBackofficeHost}/hasFunctionality`);
    } catch (e) {
      logger.error('Error requesting funcionality', e);
    }
    return false;
  }

  async hasBalanceToTranscript(audioLength) {
    try {
      return await axios.get(`${this.nectarBackofficeHost}/transcript/has-balance?length=${audioLength}`);
    } catch (e) {
      logger.error('Error requesting funcionality', e);
    }
    return false;
  }
}
