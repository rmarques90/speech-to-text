export default class NotAllowedException extends Error {
  constructor(props) {
    super(props);
    this.message = props.message;
    this.statusCode = props.statusCode || 409;
  }
}
