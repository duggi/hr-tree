```
   ~~~~   _  _ ___      _____ ___ ___ ___   ~~~~
    ~~~  | || | _ \\   |_   _| _ | __| __|  ~~~
     ~~  | __ |   /      | | |   | _|| _|   ~~
      ~  |_||_|_|_\\     |_| |_|_|___|___|  ~
      ~                                     ~
     ~~                                     ~~
    ~~~              HR Tree                ~~~
   ~~~~                                     ~~~~
```

"Plus Aire" is a fictional company with 2,609 employees. Their org chart is described by a graph, where \`Reports To Position ID\` points to the manager of a given employee.

For purposes of this demo, names have been obfuscated by \`_lib/jsonmask\`


## FEATURES
- HR org chart display and traversal
- Takes as input an Excel file created by HR from an ADP dump, converted to csv, and then json
- Displays employee, their manager, and their reports (if any)


## REQUIREMENTS
· Must be fool-proof to use and share by non-technical business users
· Must be launchable into a browser
· Must not require anything other than native HTML and JavaScript
· Must be updatable with new data by non-technical HR team
· Must be searchable by employee name
· Must display employee's manager and any direct reports
· Must be traversable by clicking manager or reports
. Must be completed in a tight timeline (one week)


## DESIGN
· Written with flat HTML and native JavaScript ES6
. Not a SPA - request/response roundtrip with query string paramaters
· HTML file calls all dependencies within the same folder
· Updatable with new data by placing an Excel or csv file into a shared directory
  · If an Excel file is placed, it is converted to csv
  · Incremental data file must conform to column names
  · CSV data file is converted to JSON, then assigned to a JavaScript variable
· Main script contains three classes:
  1. Util       # static utility and convenience functions
  2. Employee   # instantiates employee objects from data file
  3. Page       # page controller


## TECH NOTES
- On each update of the HR Excel file, the column names may change or shift in order. The order will not matter, but removal or name changes of mapped columns must be remapped in `org-script.js` > `PAGE.constructEmployees` and in the `Class Employee` constructor

- The manager/staff relationship is expressed in the data in the staff -> manager direction only through the "Reports to Position ID" column
