/* eslint-disable require-jsdoc */
export class ExpectedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ExpectedError";
	}
}
