import { Bill, BillGenerator, Rates } from "../src/utils/bill-generator";

const zeroRate: Rates = {
	base: {
		distance: 0,
		time: 0,
		waitTime: 0,
	},
	rider: {
		cancellation: 0,
		tax: {
			percentage: 0,
		},
		platformFee: 0,
	},
	driver: {
		cancellation: 0,
		tax: {
			percentage: 0,
		},
		platformFee: {
			percentage: 0,
		},
	},
};

const zeroBill: Bill = {
	base: {
		distance: 0,
		time: 0,
		waitTime: 0,
		total: 0,
	},
	rider: {
		cancellation: 0,
		tax: 0,
		platformFee: 0,
		total: 0,
	},
	driver: {
		cancellation: 0,
		tax: 0,
		platformFee: 0,
		total: 0,
	},
};

describe("Bill Generator Math", () => {
	it("When bill data is not set returns zero bill", () => {
		const billGenerator = new BillGenerator(zeroRate);
		expect(billGenerator.generateBill()).toStrictEqual(zeroBill);
	});

	describe("Given rate(base.distance) is integer", () => {
		it("When rate is 0 and data is 10 then base.distance is 0", () => {
			const billGenerator = new BillGenerator(zeroRate);

			billGenerator.billData.base.distance = 10;

			expect(billGenerator.generateBill()).toStrictEqual(zeroBill);
		});

		it("When rate is 10 and data is 0 then base.distance is 0", () => {
			const billGenerator = new BillGenerator({
				...zeroRate,
				base: {
					...zeroRate.base,
					distance: 10,
				},
			});

			expect(billGenerator.generateBill()).toStrictEqual(zeroBill);
		});

		it("When rate is 10 and data is 10 then base.distance is 100", () => {
			const billGenerator = new BillGenerator({
				...zeroRate,
				base: {
					...zeroRate.base,
					distance: 10,
				},
			});

			billGenerator.billData.base.distance = 10;

			expect(billGenerator.generateBill()).toStrictEqual({
				...zeroBill,
				base: {
					...zeroBill.base,
					distance: 100,
					total: 100,
				},
			});
		});

		it("When rate is 10 and data is -10 then base.distance is 100", () => {
			const billGenerator = new BillGenerator({
				...zeroRate,
				base: {
					...zeroRate.base,
					distance: 10,
				},
			});

			billGenerator.billData.base.distance = -10;

			expect(billGenerator.generateBill()).toStrictEqual({
				...zeroBill,
				base: {
					...zeroBill.base,
					distance: 100,
					total: 100,
				},
			});
		});

		it("When rate is -10 and data is 10 then base.distance is 100", () => {
			const billGenerator = new BillGenerator({
				...zeroRate,
				base: {
					...zeroRate.base,
					distance: -10,
				},
			});

			billGenerator.billData.base.distance = 10;

			expect(billGenerator.generateBill()).toStrictEqual({
				...zeroBill,
				base: {
					...zeroBill.base,
					distance: 100,
					total: 100,
				},
			});
		});

		it("When rate is -10 and data is -10 then base.distance is 100", () => {
			const billGenerator = new BillGenerator({
				...zeroRate,
				base: {
					...zeroRate.base,
					distance: -10,
				},
			});

			billGenerator.billData.base.distance = -10;

			expect(billGenerator.generateBill()).toStrictEqual({
				...zeroBill,
				base: {
					...zeroBill.base,
					distance: 100,
					total: 100,
				},
			});
		});
	});

	describe("Given rate (rider.tax) is PercentageValue", () => {
		it("When rate is 0 and base total is 100 then rider.tax is 0", () => {
			const billGenerator = new BillGenerator({
				...zeroRate,
				base: {
					...zeroRate.base,
					distance: 10,
				},
			});

			billGenerator.billData.base.distance = 10;

			expect(billGenerator.generateBill()?.rider.tax).toBe(0);
		});

		it("When rate is 10 and base total is 0 then rider.tax is 0", () => {
			const billGenerator = new BillGenerator({
				...zeroRate,
				base: {
					...zeroRate.base,
					distance: 10,
				},
				rider: {
					...zeroRate.rider,
					tax: {
						percentage: 10,
					},
				},
			});

			expect(billGenerator.generateBill()?.rider.tax).toEqual(0);
		});

		it("When rate is 10 and base total is 100 then rider.tax is 10", () => {
			const billGenerator = new BillGenerator({
				...zeroRate,
				base: {
					...zeroRate.base,
					distance: 10,
				},
				rider: {
					...zeroRate.rider,
					tax: {
						percentage: 10,
					},
				},
			});

			billGenerator.billData.base.distance = 10;

			expect(billGenerator.generateBill()?.rider.tax).toEqual(10);
		});

		it("When rate is -10 and base total is 100 then rider.tax is 10", () => {
			const billGenerator = new BillGenerator({
				...zeroRate,
				base: {
					...zeroRate.base,
					distance: 10,
				},
				rider: {
					...zeroRate.rider,
					tax: {
						percentage: -10,
					},
				},
			});

			billGenerator.billData.base.distance = 10;

			expect(billGenerator.generateBill()?.rider.tax).toEqual(10);
		});
	});
});

describe("Base Part", () => {
	describe("Given base rate is all 10", () => {
		it("When base data are all 10 then base values are all 100 and total is 300", () => {
			const billGenerator = new BillGenerator({
				...zeroRate,
				base: {
					...zeroRate.base,
					distance: 10,
					time: 10,
					waitTime: 10,
				},
			});

			billGenerator.billData.base.distance = 10;
			billGenerator.billData.base.time = 10;
			billGenerator.billData.base.waitTime = 10;

			expect(billGenerator.generateBill()).toStrictEqual({
				...zeroBill,
				base: {
					...zeroBill.base,
					distance: 100,
					time: 100,
					waitTime: 100,
					total: 300,
				},
			});
		});

		it("When base data are all 0 then base values are all 0 and total is 0", () => {
			const billGenerator = new BillGenerator({
				...zeroRate,
				base: {
					...zeroRate.base,
					distance: 10,
					time: 10,
					waitTime: 10,
				},
			});

			expect(billGenerator.generateBill()).toStrictEqual({
				...zeroBill,
				base: {
					...zeroBill.base,
					distance: 0,
					time: 0,
					waitTime: 0,
					total: 0,
				},
			});
		});
	});
});

describe("Rider Part", () => {
	describe("Given rider rate is all 10", () => {
		it("When base total is 100 and cancellation is 0 then platform fee, tax is 10, cancellation is 0 and total is 20", () => {
			const billGenerator = new BillGenerator({
				...zeroRate,
				base: {
					...zeroRate.base,
					distance: 10,
				},
				rider: {
					...zeroRate.rider,
					platformFee: 10,
					tax: {
						percentage: 10,
					},
				},
			});

			billGenerator.billData.base.distance = 10;

			expect(billGenerator.generateBill()).toStrictEqual({
				...zeroBill,
				base: {
					...zeroBill.base,
					distance: 100,
					total: 100,
				},
				rider: {
					...zeroBill.rider,
					platformFee: 10,
					tax: 10,
					total: 20,
				},
			});
		});

		it("When base total is 0 and cancellation is 0 then platform fee is 10, tax is 0, cancellation is 0 and total is 10", () => {
			const billGenerator = new BillGenerator({
				...zeroRate,
				base: {
					...zeroRate.base,
					distance: 10,
				},
				rider: {
					...zeroRate.rider,
					platformFee: 10,
					tax: {
						percentage: 10,
					},
				},
			});

			expect(billGenerator.generateBill()).toStrictEqual({
				...zeroBill,
				rider: {
					...zeroBill.rider,
					platformFee: 10,
					total: 10,
				},
			});
		});

		it("When base total is 100 and cancellation is 1 then platform fee is 0, tax is 10, cancellation is 10 and total is 20", () => {
			const billGenerator = new BillGenerator({
				...zeroRate,
				base: {
					...zeroRate.base,
					distance: 10,
				},
				rider: {
					...zeroRate.rider,
					cancellation: 10,
					platformFee: 10,
					tax: {
						percentage: 10,
					},
				},
			});

			billGenerator.billData.base.distance = 10;
			billGenerator.billData.rider.cancellation = 1;
			billGenerator.billData.rider.tax = 1;
			billGenerator.billData.rider.platformFee = 0;

			expect(billGenerator.generateBill()).toStrictEqual({
				...zeroBill,
				base: {
					...zeroBill.base,
					distance: 100,
					total: 100,
				},
				rider: {
					...zeroBill.rider,
					platformFee: 0,
					tax: 10,
					cancellation: 10,
					total: 20,
				},
			});
		});
	});
});
