# HR Tree
- HR org chart display and traversal
- Takes as input an Excel file created by HR from an ADP dump, converted to csv, and then json
- Displays employee, their manager, and their reports (if any)



## Tech Notes
- On each update of the HR Excel file, the column names may change or shift in order. The order will not matter, but removal or name changes of mapped columns must be remapped in `org-script.js` > `PAGE.constructEmployees` and in the `Class Employee` constructor

- The manager/staff relationship is expressed in the data in the staff -> manager direction only through the "Reports to Position ID" column
