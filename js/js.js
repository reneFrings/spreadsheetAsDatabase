/**
 * spreadsheetAsDatabase v1.0
 * Use a google spreadsheet as database. 3 Classes to make a google sheet API request and select the data from a sheet.
 * Copyright (c) 2021 René Frings https://www.seoset.de
 * License: GNU Affero General Public License v3.0
 */

/**
 * class SpreadsheetUrl(strApiKey)
 * do: Creates Spreadsheet API URL and save the URL in the localstorage. Check if URL exist in localstorage and get the url.
 ***
 * Properties:
   - Parameter(strApiKey) - Google API Key
   - get value: Check if an API URL exist in the localstorage and returns the URL by success or false.
   - set value(strSpreadsheetId): Saves the created API URL in the localstorage.
 */
   class SpreadsheetUrl{

    /** Declare private properties */
    #_strLsKey;
    #_strApiKey;

    constructor(strApiKey) {

        /** Localstorage Key where the Spreadsheet URL will save. */
        this.#_strLsKey = 'ls_spreadsheet_url';

        /** Check parameter - Google Spreadsheet API Key. */
        try{
            /** If empty */
            if(strApiKey === '') throw 'Please add your API key as parameter! This one is empty.';
            /** If only multiple whitespaces */
            if(strApiKey.match(/\S/i) === null) throw 'Please add a valid API key as parameter! This one consists only whitespaces.';
            /** If consists whitespaces */
            if(strApiKey.match(/\s/i)) throw 'Please add a valid API key as parameter! This one consists whitespaces.';
            /** If to short */
            if(strApiKey.length < 10) throw 'Please add a valid API key as Parameter! This one seems to short.';
        }
        catch(err){
            throw new Error(`Class SpreadsheetUrl - API Key error: ${err} for parameter: ${strApiKey}`);
        }

        /** Google Spreadsheet API Key */
        this.#_strApiKey = strApiKey;

    }

    /**
     * set value(strSpreadsheetId)
     * do: Creates Spreadsheet API URL and save the URL in the localstorage in ls_spreadsheet_url:url
     ***
     * param: 
        - Spreadsheet Id
        - strSheetName
     */
        save(strSpreadsheetId,strSheetName){

            try{
                /** If strSpreadsheetId is empty */
                if(strSpreadsheetId.length === '' ) throw `Please add a valid spreadsheet ID as parameter! Your spreadsheet ID is empty: ${strSpreadsheetId}!`;
                /** If strSpreadsheetId consists only multiple whitespaces */
                if(strSpreadsheetId.match(/\S/i) === null) throw 'Please add a valid spreadsheet ID as parameter! This one consists only whitespaces.';
                /** If strSpreadsheetId is to short */
                if(strSpreadsheetId.length < 5 ) throw `No valid spreadsheet ID: ${strSpreadsheetId}!`;
                /** If strSheetName is empty */
                if(strSheetName.length === '' ) throw `Please add a valid sheetname as parameter! Your sheetname is empty: ${strSheetName}!`;
                /** If strSheetName consists only multiple whitespaces */
                if(strSheetName.match(/\S/i) === null) throw 'Please add a valid sheetname as parameter! This one consists only whitespaces.';
            }
            catch(err){
                throw new Error(`SpreadsheetUrl.save(strSpreadsheetId,strSheetName): ${err}`);
            }

            /** Create and save the API URL. */
            let strGoogleSheetApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${strSpreadsheetId}/values/${strSheetName}?alt=json&key=${this.#_strApiKey}`;

            /** Add the API URL to localstorage. */
            localStorage.setItem(this.#_strLsKey,strGoogleSheetApiUrl);
        }

    /**
     * get value()
     * do: Check if an API URL exist in the localstorage and returns the URL by success.
     *** 
     * return: URL/false
     */
        get value(){

            /** If the localstorage key "ls_spreadsheet_url" exist, an API URL also exist. */
            if(localStorage.getItem(this.#_strLsKey)){
                /** Returns the value of 'ls_spreadsheet_url'. */
                return localStorage.getItem(this.#_strLsKey);
            }
            /** If no API URl exist. */
            else
            {
                return false;
            }

        }

    }

 
/**
 * class SpreadsheetData
 * do: Fetch the sheet data about the google sheet API url and returns the results as two different arrays (arrApiResultSheetData and arrDatasets) or an error.
 ***
 * Properties:
   - Parameter(strGoogleSheetApiUrl), the Google API Spreadsheet URL: https://sheets.googleapis.com/v4/spreadsheets/SHEETID/values/SHEET_NAME?alt=json&key=API_KEY
   - get getData: 
        - getData.arrApiResultSheetData = Original Array with all datasets. Each row is an array. Cell values of a row are the elements. [[cellValue1,cellValue2,cellValue3],[cellValue1,cellValue2,cellValue3]]
        - getData.arrDatasets = Transformed array with all datasets. Each row is an object like [{colName1:cellValue1,colName2:cellValue2...},{colName1:cellValue1,colName2:cellValue2...}]
 */
    class SpreadsheetData{
        
        /** Private Properties deklarieren */
        #_strGoogleSheetApiUrl;


        constructor(strGoogleSheetApiUrl) {

            /** Check API URL. */
            try{
                /** If no valid API URL. */
                if(!strGoogleSheetApiUrl.match(/https:\/\/sheets.googleapis.com\/v4\/spreadsheets\/[^\/]*\/values\/[^\/]*\\?alt=json.*/i)) throw 'The api url does not match the pattern!';
            }
            catch(err)
            {
                throw new Error(`SpreadsheetData(strGoogleSheetApiUrl) Parameter: ${err}`);
            }

            /** Save API URL. */
            this.#_strGoogleSheetApiUrl = strGoogleSheetApiUrl;
        }


        /**
         * get getData()
         * do: Fetch the sheet data and returns the results as two different arrays or an error.
         *** 
         * return:
         *  {    
         *   original: arrApiResultSheetData,  // Original Array with all datasets. Each row is an array. Cell values of a row are the elements. [[cellValue1,cellValue2,cellValue3],[cellValue1,cellValue2,cellValue3]]
         *   transformed: arrDatasets          // Transformed array with all datasets. Each row is an object like [{colName1:cellValue1,colName2:cellValue2...},{colName1:cellValue1,colName2:cellValue2...}]
         *  };
         */
            get getData(){

                /** URL Request */
                return fetch(this.#_strGoogleSheetApiUrl)

                /** If the request is finish and returns a response. */
                .then(response => {

                    /** If the response returns an error - response = {ok: false}. */
                    if (!response.ok) {
                        /** Throw an error with status. */
                        throw (`API url request failed! status: ${response.status}. Please check your api url and share settings for this spreadsheet. Have you shared the spreadsheet so that anyone who has the link can open it?`);
                    }
                    /** If response is successful - response = {ok: true} */
                    else{
                        return response.json();
                    }
                })
                /** 
                 * arrApiResultSheetData includes an array from the API request with all sheet data. 
                 * This sheet data will transformed here to a new array, where each row is an one object: [{colName1:cellValue1,colName2:cellValue2...},{colName1:cellValue1,colName2:cellValue2...}]
                 */
                .then(arrApiResultSheetData => {

                    /** 
                     * Colnames Array
                     * arrTableHeadings saves the first array element from arrApiResultSheetData. That are the colnames like ['Title', 'Type', 'Medium', 'Genres', 'Actors', 'Location', 'Tags'] 
                     */
                    let arrTableHeadings = arrApiResultSheetData.values[0];

                    /** 
                     * Saves the colnames in an object and the object as string.
                     * The object should be an primitive type and not an reference type, so the key values will not overwritten.
                     */
                    let strTableHeadingsObject = this.#_createTableHeadingsObjectString(arrTableHeadings);

                    /** The final transformed array, which saves all datasets as objects in this array. */
                    let arrDatasets = [];

                    /** 
                     * Loopes the original requested array with all data. 
                     * Each row is an array. Cell values of a row are the elements.
                     */
                    for (let row = 1; row < arrApiResultSheetData.values.length; row++) {

                        /** Adds the object with colnames as keys to arrDatasets as new element. Like {Title: '', Movie: '', Series: '', Medium: '', Genres: '', …} */
                        arrDatasets.push(JSON.parse(strTableHeadingsObject));

                        /** Loopes the array with colnames. */
                        for(let i = 0; i < arrTableHeadings.length; i++){
                            
                            /** Cell value. */
                            let strCellValue = '';
                            
                            /** If the current cell value is "undefined", adds an empty value as cell value. That avoid problems for later methods like filtering. */
                            if(arrApiResultSheetData.values[row][i] === undefined){
                                strCellValue = '';
                            }
                            else{
                                /** Saves the current cell value from arrApiResultSheetData. */
                                strCellValue = arrApiResultSheetData.values[row][i];
                            }

                            /** 
                             * Adds the current cell value from arrApiResultSheetData to the current object key. 
                             * The object ist the current element from arrDatasets.
                             * Like: arrDatasets[0]['Title'] = 'Prometheus' 
                             */
                            arrDatasets[row-1][arrTableHeadings[i]] = strCellValue;
                            
                        }

                    }

                    /** Returns the final object for getData with two arrays. */
                    return {    
                        arrApiResultSheetData: arrApiResultSheetData,   // Example: arrApiResultSheetData = [[cellValue1,cellValue2,cellValue3],[cellValue1,cellValue2,cellValue3]]
                        arrDatasets: arrDatasets                        // Example: arrDatasets = [{colName1:cellValue1,colName2:cellValue2...},{colName1:cellValue1,colName2:cellValue2...}]
                    };
                })
                /** If the API request failed. */
                .catch(err => {
                    throw new Error(`SpreadsheetData.getData: ${err}`)
                });
            }

        /**
         * #_createTableHeadingsObjectString(arr)
         * do: Returns an object as string. Creates object keys from the array (arr) element values.
         *** 
         * return: Object as String.
         * param: Array
         */
            #_createTableHeadingsObjectString(arr){

                /** Check Parameter */
                try{
                    /** If arr is no array. */
                    if(!Array.isArray(arr)) throw 'Parameter must be an array!';
                }
                catch(err){
                    throw new Error (`SpreadsheetData.#_createTableHeadingsObjectString(arr): ${err}. Parameter type is: ${typeof arr}.`);
                }

                /** Create empty object. */
                let tempObj = {};

                /** Add object keys. Each key is a colname. */
                for (let title of arr) {
                    tempObj[title] = '';
                }

                /** Return object as String. */
                return JSON.stringify(tempObj);
            }

    
    }


/** 
 * class SpreadsheetDataQueries(arrDatasets)
 * do: Data queries like select data by filter and columns, sort data.
 ***
 * Properties:
   - Parameter(arrDatasets), the array with all datasets as objects.
   - get getRandomDataset: Returns a random dataset (object).
   - get getAllColNames: Returns an array with all colnames.
   - get getColNames: Returns an array with all colnames from the current selected data.
   - get countCols: Returns amount (int) of cols from the current selected data.
   - get countRows: Returns amount (int) of rows from the current selected data.
 * Methods:
   - selectDatasetsBy(objFilter={},arrCols=[]): Select data by optional parameters (objFilter={},arrCols=[]) and returns an array with selected datasets as elements (objects). E.g. this.#_arrDatasets = [{Title:'Prometheus',Movie:'x',...},{Title:'Avatar',Movie:'x',...}]
   - sortDatasetsByColumn(_arrDatasets,column,order='a-z'): returns sorted data (this.#_arrDatasets) by column a-z oder z-a.
   - seperateValuesFromColumns(arrColumnsToSeperate): Seperates cell values from columns and returns an object like {Genres: arrSeperatedValues,Tags: arrSeperatedValues}
 */
    class SpreadsheetDataQueries{
        
        /** Private Properties deklarieren */
        #_arrDatasets;
        #_arrColumnNames;
        #_strAllDatasets;

        constructor(arrDatasets) {

            /** Check Parameter */
            try{
                /** If no parameter passed. */
                if(!arrDatasets) throw 'A parameter muss be passed!';
                /** If arrDatasets is no array. */
                if(!Array.isArray(arrDatasets)) throw 'The Parameter must be an array!';
                /** If arrDatasets is empty. */
                if(arrDatasets.length === 0) throw 'The array is empty!';
                /** If one element from arrDatasets is no object. */
                if(arrDatasets.map(element => typeof element === 'object').includes(false)) throw 'Each element of the array must be an object!';
            }
            catch(err){
                throw new Error (`Parameter for class SpreadsheetDataQueries(arrDatasets): ${err}`);
            }

            /** Array with all datasets as objects. */
            this.#_arrDatasets = arrDatasets;

            /** All colnames as values in an array. */
            this.#_arrColumnNames = Object.keys(this.#_arrDatasets[0]);

            /** The array with all datasets as objects as string (primitive type). */
            this.#_strAllDatasets = JSON.stringify(arrDatasets);

        }
        
        /**
         * get #_arrAllDatasets()
         * do: Returns the array with all datasets as objects as string (primitive type).
         ***
         * return: Array as string.
         */
            get #_arrAllDatasets(){
                return JSON.parse(this.#_strAllDatasets);
            }

        /** 
         * selectDatasetsBy(objFilter={},arrCols=[])
         * do: Select data by optional parameters filter objFilter={},arrCols=[].
         * note: Each query select from all data, so you can make new queries and don´t select from the result before.
         ***
         * return: Array with selected datasets as elements (objects). 
         * param (Optional): objFilter={key:[...],key:[...]} or null, arrCols=[...].
            * null, if you passed only the second parameter.
            * Example: 
                objFilter = {Genres: ['Fantasy','Action','Thriller'],Tags: ['Space','Favorite','Top10']}
                arrCols = ['Title','Genres','Tags']
         */
            selectDatasetsBy(objFilter={},arrCols=[]){

                /** 
                 * If the 1st parameter is null, save in object in objFilter.
                 */
                    if(objFilter === null){
                        objFilter={};
                    }

                /** Check parameter */
                    try{
                        /** objFilter must be an object.*/
                        if(Array.isArray(objFilter) || typeof objFilter !== 'object' || objFilter === null) throw '1. Parameter must be an object!';
                        /** Each value of an objFilter key must be an array. */
                        if(Object.values(objFilter).map(element => (Array.isArray(element)) ? true : false).includes(false)) throw '1. Parameter - Each value of an object key must be an array!';
                        /** arrCols must be an array. */
                        if(!Array.isArray(arrCols)) throw '2. Parameter must be an array!';
                        /** If colnames from arrCols doesn´t exist in the data of #_arrAllDatasets. */
                        if(arrCols.map(element => Object.keys(this.#_arrAllDatasets[0]).includes(element)).includes(false)) throw '2. Parameter - values from the array doesn´t exist in the data as colnames!';
                    }
                    catch(err) {
                        throw new Error(`Parameter for SpreadsheetDataQueries.selectDatasetsBy(objFilter={},arrCols=[]): ${err}`);
                    }
                
                /**
                 * Order is important! #_arrDatasets must be saved first based of all datasets. #_filterDatasets(objFilter) based of all datasets.
                 * #_getDatasetsByColumns(arrCols) saves the data by the selected columns based on the result before in #_arrDatasets.
                 */

                    /** If filter exists */
                    if(Object.keys(objFilter).length > 0){
                        /** Save filtered data */
                        this.#_arrDatasets = this.#_filterDatasets(objFilter);
                    }
                    else{
                        /** Save all data. */
                        this.#_arrDatasets = this.#_arrAllDatasets;
                    }

                    /** If colsnames exists */
                    if(arrCols.length > 0){
                        /** Save data by colnames. */
                        this.#_arrDatasets = this.#_getDatasetsByColumns(arrCols);
                    }

                /** 
                 * Return an error or an result. 
                 */
                    /** If the result is empty. */
                    if(this.#_arrDatasets.length === 0){
                        throw new Error('SpreadsheetDataQueries.selectDatasetsBy(objFilter={},arrCols=[]) - Your query get an empty result! Please change your filter or column criterias.');
                    }
                    else{
                        /** Return array with selected datasets as elements (objects). */
                        return this.#_arrDatasets;
                    }

            }

            /** 
             * #_getDatasetsByColumns(_arrDatasets,arrCols)
             * do: Returns array with datasets by colnames.
             ***
             * return: Array with datasets by colnames.
             * param:
                 * arrCols = Array with colnames like ['Title','Genres','Tags']
             */
                #_getDatasetsByColumns(arrCols){

                    /** Filter the values from from #_arrColumnNames which arrCols not includes. */
                    let arrDeleteThisCols = this.#_arrColumnNames.filter(key => !arrCols.includes(key));

                    /** 
                     * Deletes all key:values from #_arrDatasets elements which arrCols not includes.
                     * Example: this.#_arrDatasets.filter("Element (object) from this.#_arrDatasets[]" => "['Actors','Location','Movie']".map('Location' => delete "Object from #_arrDatasets['Location']")); 
                     */
                    return this.#_arrDatasets.filter(key => arrDeleteThisCols.map(delThisKey => delete key[delThisKey]));
                    
                }

                /**
                 * #_filterDatasets(objFilter)
                 * do: Returns the filtered array with datasets in order of the keys in objFilter.
                 * Note: The next key (filter) in objFilter filters the previously filtered data. Only one filter goes after the other. 
                         A different order of the keys can also provide different data sets.
                 ***
                 * return: Array with filtered datasets.
                 * param: Example objFilter = {Genres: ['Fantasy','Action','Thriller'], Tags: ['Space','Favorite','Top10']}
                 */
                #_filterDatasets(objFilter){

                    /** Saves the filtered datasets. */
                    let arrFilteredDatasets = '';

                    /** Counter */
                    let intFilterLoop = 0;

                    /** Loops each key:value from objFilter. */
                    for(let objkeyFilterColumn in objFilter){
                    
                        /** 
                         * If it is the first pass #_arrDatasets should be filtered.
                         * In the next pass arrFilteredDatasets should filter, which contains the previously filtered data.
                         */
                        if(intFilterLoop === 0){
                            arrFilteredDatasets = this.#_arrAllDatasets;
                        }
                        
                        /** Filter arrFilteredDatasets */
                        arrFilteredDatasets = arrFilteredDatasets.filter(

                            /** objDataset contains an element (dataset as object) from arrFilteredDatasets. E.g. {Title: 'Prometheus', Medium: 'Blu Ray', Genres:...} */
                            function (objDataset) {
                            
                                /** 
                                 * Searched in each array from each objFilter key. E.g. { Genres: ['Fantasy','Action','Thriller'],Tags: ['Space','Favorite','Top10']}
                                 * until the condition objDataset[objkeyFilterColumn].includes(arrFilterElement) applies 
                                 */
                                return objFilter[objkeyFilterColumn].some(
                                    
                                    /** arrFilterElement contains an element from objFilter, e.g. objFilter['Genres']. */
                                    function (arrFilterElement){

                                        /** 
                                         * Check if objDataset[objkeyFilterColumn] value includes arrFilterElement.
                                         * E.g. 'Prometheus'.includes('Prometheus').
                                         * arrFilterElement can be for e.g. 'anta' and would includes in 'Fantasy'.
                                         */
                                        return objDataset[objkeyFilterColumn].includes(arrFilterElement);

                                    }
                                ); 
                            }
                        ); 

                        /** increase by 1 */
                        intFilterLoop++;
                    }

                    /** Returns the filtered array with datasets */
                    return arrFilteredDatasets;
                }


        /** 
         * sortDatasetsByColumn(_arrDatasets,column,order='a-z')
         * do: sort #_arrDatasets by column a-z oder z-a
         ***
         * return: Sorted array with datasets.
         * param:
            * strColumn = colname
            * strOrder = Sort order
         */
        sortDatasetsByColumn(strColumn,strOrder='a-z'){

            /** Check Parameter */
            try{
                /** 1st parameter must be a-z or z-a */
                if(strOrder !== 'a-z' && strOrder !== 'z-a') throw '1st parameter must be a-z or z-a!';
                /** If 1st parameter doesn´t exist in the first dataset as key (colname). */
                if(!Object.keys(this.#_arrDatasets[0]).includes(strColumn)) throw `1st parameter - The column "${strColumn}" doesn´t exist! One reason could be that you selected by column before.`;
            }
            catch(err){
                throw new Error(`Parameter for SpreadsheetDataQueries.sortDatasetsByColumn(strColumn,strOrder): ${err}`);
            }

            /** returns the sorted data array. */
            return this.#_arrDatasets.sort(function(a, b) {
                var nameA = a[strColumn].toUpperCase(); // ignore upper+lowercase
                var nameB = b[strColumn].toUpperCase(); // ignore upper+lowercase

                if(strOrder === 'a-z'){
                    if (nameA < nameB) {
                    return -1;
                    }
                    if (nameA > nameB) {
                    return 1;
                    }
                }

                if(strOrder === 'z-a'){
                    if (nameA < nameB) {
                    return 1;
                    }
                    if (nameA > nameB) {
                    return -1;
                    }
                }
            
                // names must be equal
                return 0;
              });
        }  

        /**
         * seperateValuesFromColumns(arrColumnsToSeperate)
         * do: Returns an object with arrays. Each array contains separated values without duplicates from a column. {colname:arrSeperatedValues,colname:arrSeperatedValues}
         * note: Based on the current selected data. If you filter before, some column values could be missed.
         ***
         * return: Object e.g.:
           let objColumnsSeperatedValues = 
            {
             Genres: arrSeperatedValues,
             Tags: arrSeperatedValues
            }
         * param: Object e.g.:
            [
                {
                  column: 'Genres',
                  seperator: ','
                },
                {
                  column: 'Movie',
                  seperator: ','
                }
            ];
         */
         seperateValuesFromColumns(arrColumnsToSeperate){

            /** Check Parameter */
            try{
                /** arrColumnsToSeperate must be an array. */
                if(!Array.isArray(arrColumnsToSeperate)) throw 'Parameter must be an array!';
                /** Each element of arrColumnsToSeperate must be an object. */
                if(arrColumnsToSeperate.map(element => Array.isArray(element) || typeof element !== 'object' || element === null).includes(true)) throw 'Each element of the parameter (array) must be an object!';
                /** If arrColumnsToSeperate elements have no key. */
                if(arrColumnsToSeperate.map(element => Object.keys(element).length === 0).includes(true)) throw 'The objects in the array has no keys!';
                /** The keys in arrColumnsToSeperate elements must be 'column' and 'seperator'. */
                if(arrColumnsToSeperate.map(element => !Object.keys(element)[0] === 'column' || !Object.keys(element)[1] === 'seperator').includes(true)) throw 'The keys in the array elements must be "column" and "seperator"';
                /** arrColumnsToSeperate elements must have exact 2 keys. */
                if(arrColumnsToSeperate.map(element => !Object.keys(element).length === 2).includes(true)) throw 'The array elements must have exact 2 keys "column" and "seperator"!';
                /** If the value (colname) from arrColumnsToSeperate[n].column doesn´t exist in the first dataset of #_arrAllDatasets. */
                if(arrColumnsToSeperate.map(element => !Object.keys(this.#_arrDatasets[0]).includes(element.column)).includes(true)) throw `Colname(s) from the key value in the parameter doesn´t exist. One reason could be that you selected by column before.`;               
            }
            catch(err){
                throw new Error(`Falscher Parameter für seperateValuesFromColumns(arrColumnsToSeperate): ${err}`);
            }
            
            /** Object which saves the seperated values from columns. */
            let objColumnsSeperatedValues = {};

            /** 
             * Loop arrColumnsToSeperate.
             * objToSeperate is an object like {column: 'Genres',seperator: ','}
             */
            for (let objToSeperate of arrColumnsToSeperate) {

                /** 
                 * If the value (colname) from objToSeperate.column doesn´t exist in #_arrDatasets. One reason could be that you selected by column before.
                 */
                if(this.#_arrDatasets.map(objDataset => (objToSeperate.column in objDataset) ? true : false).includes(false)){
                    console.log(`Col "${objToSeperate.column}" doesn´t exist in the data!`);
                    /** Jump to the next loop */
                    continue;
                }
            
                /** 
                 * Saves seperated values without duplicates from each cell by column in an array as elements. 
                 * Das Array mit den Werten was erzeugt wird, nenne ich für die Erklärung arrColumnValues. arrColumnValues sieht man aber nicht im Code. 
                 */  
                let arrSeperatedValues = this.#_arrDatasets.    
                /** Generate a temp array with each value from e.g. #_arrDatasets[n]['Genres']) as elements: ['Science-Fiction,Fantasy', 'Adventure,Fantasy', 'Drama,Thriller'] */          
                map(arrDatasetsElement => arrDatasetsElement[objToSeperate.column]).
                /** Split each element from the temp array by objToSeperate.seperator into arrays: [['Science-Fiction','Fantasy'],['Adventure','Fantasy'],['Drama','Thriller']] */
                map(strColumnValues => strColumnValues.split(objToSeperate.seperator).
                /** Trim each value from each array. */
                map(arrColumnValueArray => arrColumnValueArray.trim())).
                /** Change all values from the main array to a string and split this string by ',' to an array: ['Science-Fiction','Fantasy','Adventure','Fantasy','Drama','Thriller']. */
                join().split(',').
                /** Filter only values with content from this array, no empty values. */
                filter(columnValues => columnValues.match(/\S/i));
            
                /** Remove all duplicates and sort the array values: ['Adventure','Drama','Fantasy','Science-Fiction','Thriller']. */
                arrSeperatedValues = [...new Set(arrSeperatedValues)].sort(); 

                /** Add the array as value to the object key. */
                objColumnsSeperatedValues[objToSeperate.column] = arrSeperatedValues;
            }

            /** Returns the final object with seperated values. E.g. objColumnsSeperatedValues = {Genres: arrSeperatedValues,Tags: arrSeperatedValues} */
            return objColumnsSeperatedValues;
        }

        /** 
         * get getRandomDataset()
         * do: Returns a random dataset.
         ***
         * return: Array element (object).
         */
            get getRandomDataset(){
                /** #_arrDatasets[x] */
                return this.#_arrDatasets[Math.floor(Math.random() * this.#_arrDatasets.length)];
            }

        /** 
         * get getAllColNames()
         * do: Returns an array with all colnames.
         ***
         * return: Array
         */
            get getAllColNames(){
                return this.#_arrColumnNames;
            }

        /** 
         * get getColNames()
         * do: Returns an array with all colnames from the current selected data.
         ***
         * return: Array
         */
            get getColNames(){
                return Object.keys(this.#_arrDatasets[0]);
            }       
            
        /** 
         * get countCols()
         * do: Returns amount of cols from the current selected data.
         ***
         * return: int
         */
            get countCols(){
                return Object.keys(this.#_arrDatasets[0]).length;
            }   
            
        /** 
         * get countRows()
         * do: Returns amount of rows from the current selected data.
         ***
         * return: int
         */
            get countRows(){
                return this.#_arrDatasets.length;
            }            

    }
