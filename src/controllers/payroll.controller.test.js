// const PayrollController = require('./payroll.controller');
// const PayrollCtrl = require('./payroll.controller');

// describe('Payroll dao test units', () => {

//     describe('fetch payrolls', () => {
//         let req, res;
//         beforeAll(() => {
//             req = { headers: {} };
//             res = { headers: {} };

//         })

//         it('saves a new payroll instance', async() => {
//             const now = new Date();
//             const payrollInfo = { title: 'September monthly salary', frequence: 'Monthly', from: '02-09-2020', to: '01-10-2020', payDate: '02-10-2020', status: 'Pending', totalPaymentAmount: 35780, totalEmployees: 2, payslips: [2, 3], createdOn: now, lastModifiedOn: now };
//             req = {...req, body: {payrollInfo}};
//             const savedPayrollInfo = await PayrollController.apiCreatePayroll(req, res);
//         });

//         it('fetches all payroll instances', async () => {
//             const payrolls = await PayrollController.apiGetPayrolls(req, res);

//             expect(payrolls).toBeDefined();
//             expect(Array.isArray(payrolls)).toBe(true);

//         })
//     })
// })
