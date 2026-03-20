"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_rsc_lib_activity_ts";
exports.ids = ["_rsc_lib_activity_ts"];
exports.modules = {

/***/ "(rsc)/./lib/activity.ts":
/*!*************************!*\
  !*** ./lib/activity.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   logActivity: () => (/* binding */ logActivity)\n/* harmony export */ });\n/* harmony import */ var _prisma__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./prisma */ \"(rsc)/./lib/prisma.ts\");\n\nasync function logActivity(userId, action, entityType, entityId, details) {\n    await _prisma__WEBPACK_IMPORTED_MODULE_0__.prisma.activityLog.create({\n        data: {\n            userId,\n            action,\n            entityType,\n            entityId: entityId ?? undefined,\n            details: details ?? undefined\n        }\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYWN0aXZpdHkudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBaUM7QUFFMUIsZUFBZUMsWUFDcEJDLE1BQWMsRUFDZEMsTUFBYyxFQUNkQyxVQUFrQixFQUNsQkMsUUFBd0IsRUFDeEJDLE9BQXVCO0lBRXZCLE1BQU1OLDJDQUFNQSxDQUFDTyxXQUFXLENBQUNDLE1BQU0sQ0FBQztRQUM5QkMsTUFBTTtZQUNKUDtZQUNBQztZQUNBQztZQUNBQyxVQUFVQSxZQUFZSztZQUN0QkosU0FBU0EsV0FBV0k7UUFDdEI7SUFDRjtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYmFuZ2xlLXRyYWNraW5nLWFwcC8uL2xpYi9hY3Rpdml0eS50cz8yZTBjIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHByaXNtYSB9IGZyb20gXCIuL3ByaXNtYVwiXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2dBY3Rpdml0eShcbiAgdXNlcklkOiBzdHJpbmcsXG4gIGFjdGlvbjogc3RyaW5nLFxuICBlbnRpdHlUeXBlOiBzdHJpbmcsXG4gIGVudGl0eUlkPzogc3RyaW5nIHwgbnVsbCxcbiAgZGV0YWlscz86IHN0cmluZyB8IG51bGxcbikge1xuICBhd2FpdCBwcmlzbWEuYWN0aXZpdHlMb2cuY3JlYXRlKHtcbiAgICBkYXRhOiB7XG4gICAgICB1c2VySWQsXG4gICAgICBhY3Rpb24sXG4gICAgICBlbnRpdHlUeXBlLFxuICAgICAgZW50aXR5SWQ6IGVudGl0eUlkID8/IHVuZGVmaW5lZCxcbiAgICAgIGRldGFpbHM6IGRldGFpbHMgPz8gdW5kZWZpbmVkLFxuICAgIH0sXG4gIH0pXG59XG4iXSwibmFtZXMiOlsicHJpc21hIiwibG9nQWN0aXZpdHkiLCJ1c2VySWQiLCJhY3Rpb24iLCJlbnRpdHlUeXBlIiwiZW50aXR5SWQiLCJkZXRhaWxzIiwiYWN0aXZpdHlMb2ciLCJjcmVhdGUiLCJkYXRhIiwidW5kZWZpbmVkIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/activity.ts\n");

/***/ })

};
;