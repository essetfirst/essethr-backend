// const router = require("express").Router();

// const resource = "department";
// const apiVerbToHttpMethodMap = {
//   get: "get",
//   create: "post",
//   update: "put",
//   delete: "delete",
// };

// const routeList = [
//   { routePath: "/", method: "get", queryParams: (req) => {}, middlewares: [] },
//   {
//     routePath: "/:id",
//     method: "get",
//     queryParams: (req) => ({
//       _id: req.params.id || undefined,
//     }),
//     middlewares: [
//       (req, res, next) => {
//         next();
//       },
//     ],
//   },
//   {
//     routePath: "/:id",
//     method: "put",
//     queryParams: (req) => {},
//     middlewares: [],
//   },
// ];

// routeList.forEach(({ routePath, verb, queryParams, middlewares }) => {
//   const controller = getController({ resource, verb, queryParams });
//   const method = apiVerbToHttpMethodMap[verb];
//   router.route(routePath)[method](middlewares, controller);
// });

// const getController = ({ resource, verb, queryParams }) => async (req, res) => {
//   const result = await DAOS[resource][verb]({
//     ...queryParams,
//   });

//   if (result && result.error) {
//     const error = result.server ? "Something went wrong." : result.error;
//     const status = result.server ? 500 : 400;
//     return res.status(status).json({ success: false, error });
//   }

//   switch (verb) {
//     case "get":
//       return res.json({ success: true, total_results: result.length, result });
//     case "create":
//       return res.status(201).json({
//         success: true,
//         result: result.ops[0],
//         message: "New " + resource + " created",
//       });
//     case "update":
//       return res.json({
//         success: true,
//         result: result.ops[0],
//         message: resource + " (# " + req.params.id + ") updated",
//       });
//     case "delete":
//       return res.json({
//         success: true,
//         result: result.ops[0],
//         message: resource + " (# " + req.params.id + ") deleted",
//       });
//     default:
//       return res.status(404).json({
//         success: false,
//         error: "404 - Not found",
//       });
//   }
// };
