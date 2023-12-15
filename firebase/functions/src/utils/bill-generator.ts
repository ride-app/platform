/* eslint-disable require-jsdoc */
type BooleanValue = 0 | 1;
type PercentageValue = { percentage: number; of?: string };
type NestedMap<V> = { [key: string]: V | NestedMap<V> };

// function isBooleanValue(val: number): val is BooleanValue {
// 	return (val as BooleanValue) === 0 || (val as BooleanValue) === 1;
// }

// function isPercentageValue(
// 	val: Record<string, unknown>
// ): val is PercentageValue {
// 	return (
// 		(val as PercentageValue).percentage !== undefined &&
// 		100 >= (val as PercentageValue).percentage &&
// 		(val as PercentageValue).percentage >= 0
// 	);
// }

// Rates
type RateValue = number | PercentageValue;
type RateItem = NestedMap<RateValue>;

interface Rates extends RateItem {
	base: {
		distance: number;
		time: number;
		waitTime: number;
		[key: string]: RateValue | RateItem;
	};
	rider: {
		// cancellation: number | RateValue;
		cancellation: number;
		tax: PercentageValue;
		platformFee: number;
		[key: string]: RateValue | RateItem;
	};
	driver: {
		// cancellation: number | RateValue;
		cancellation: number;
		tax: PercentageValue;
		platformFee: PercentageValue;
		[key: string]: RateValue | RateItem;
	};
}

type BillDataValue = number | BooleanValue | PercentageValue;
type BillDataItem = NestedMap<BillDataValue>;

interface BillData extends BillDataItem {
	base: {
		distance: number;
		time: number;
		waitTime: number;
		[key: string]: BillDataValue | BillDataItem;
	};
	rider: {
		cancellation: BooleanValue;
		tax: 1;
		platformFee: BooleanValue;
		[key: string]: BillDataValue | BillDataItem;
	};
	driver: {
		cancellation: BooleanValue;
		tax: 1;
		platformFee: BooleanValue;
		[key: string]: BillDataValue | BillDataItem;
	};
}

type BillItem = NestedMap<number>;

interface Bill extends BillItem {
	base: {
		distance: number;
		time: number;
		waitTime: number;
		total: number;
		[key: string]: number | BillItem;
	};
	rider: {
		cancellation: number;
		tax: number;
		platformFee: number;
		total: number;
		[key: string]: number | BillItem;
	};
	driver: {
		cancellation: number;
		tax: number;
		platformFee: number;
		total: number;
		[key: string]: number | BillItem;
	};
}

class BillGenerator {
	rates: Rates;
	billData: BillData = {
		base: {
			distance: 0,
			time: 0,
			waitTime: 0,
		},
		rider: {
			cancellation: 0,
			tax: 1,
			platformFee: 1,
		},
		driver: {
			cancellation: 0,
			tax: 1,
			platformFee: 1,
		},
	};
	// bill?: Bill;

	constructor(rates: Rates) {
		this.rates = Object.freeze(rates);
	}

	generateBill(): Bill {
		// const percentageList: Array<[string, PercentageValue]> = [];

		// function parseBillData(
		// 	object: BillDataItem,
		// 	rates: Rates,
		// 	parentKey = ''
		// ): BillItem {
		// 	const result: BillItem = {};
		// 	Object.entries(object).forEach(([key, value]) => {
		// 		if (typeof value == 'number') {
		// 			const rate = rates[key];
		// 			if (typeof rate === 'number') {
		// 				result[key] = rate * value;
		// 			} else if (isPercentageValue(rate)) {
		// 				// NOTE: still murky
		// 				percentageList.push([parentKey + '.' + key, rate]);

		// 				result[key] = (rate.percentage * value) / 100;
		// 			}
		// 		} else if (isPercentageValue(value)) {
		// 			const rate = rates[key];

		// 			if (typeof rate === 'number') {
		// 				percentageList.push([parentKey + '.' + key, value]);
		// 				result[key] = (rate * value.percentage) / 100;
		// 			}
		// 		} else if (typeof value == 'object') {
		// 			result[key] = parseBillData(value, rates);
		// 		}
		// 	});
		// 	return result;
		// }

		// const tempBill = parseBillData(this.billData, this.rates);

		// this.bill = tempBill as Bill;

		// percentageList.forEach(([key, value]) => {});

		const tempBill: NestedMap<number> = {};

		tempBill.base = {
			distance: Math.abs(
				this.rates.base.distance * this.billData.base.distance
			),
			time: Math.abs(this.rates.base.time * this.billData.base.time),
			waitTime: Math.abs(
				this.rates.base.waitTime * this.billData.base.waitTime
			),
		};

		tempBill.base.total = Math.abs(
			(tempBill.base.distance as number) +
				(tempBill.base.time as number) +
				(tempBill.base.waitTime as number)
		);

		tempBill.rider = {
			cancellation: Math.abs(
				this.rates.rider.cancellation * this.billData.rider.cancellation
			),
			tax: Math.abs(
				((Math.abs(this.rates.rider.tax.percentage) * tempBill.base.total) /
					100) *
					this.billData.rider.tax
			),
			platformFee: Math.abs(
				this.rates.rider.platformFee * this.billData.rider.platformFee
			),
		};

		tempBill.rider.total = Math.abs(
			(tempBill.rider.cancellation as number) +
				(tempBill.rider.tax as number) +
				(tempBill.rider.platformFee as number)
		);

		tempBill.driver = {
			cancellation: Math.abs(
				this.rates.driver.cancellation * this.billData.driver.cancellation
			),
			tax: Math.abs(
				((Math.abs(this.rates.driver.tax.percentage) * tempBill.base.total) /
					100) *
					this.billData.driver.tax
			),
			platformFee: Math.abs(
				((Math.abs(this.rates.driver.platformFee.percentage) *
					tempBill.base.total) /
					100) *
					this.billData.driver.platformFee
			),
		};

		tempBill.driver.total = Math.abs(
			(tempBill.driver.cancellation as number) +
				(tempBill.driver.tax as number) +
				(tempBill.driver.platformFee as number)
		);

		// this.bill = tempBill as Bill;
		return tempBill as Bill;
	}
}

export {
	Rates,
	BillData,
	Bill,
	BillGenerator,
	BillDataItem,
	BillDataValue,
	RateItem,
	RateValue,
	BooleanValue,
	PercentageValue,
};
