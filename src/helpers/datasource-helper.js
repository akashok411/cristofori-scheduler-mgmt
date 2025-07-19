'use strict';

const datasourceTypes = {
    rest:'rest',
    postgre:'postgre',
};
const executionTypes = { 
    rest:{ post:'post', get:'get' ,getHeader:'getHeader', },
    postgre:{ 
        singleWithReplace:'singleWithReplace', 
        multiWithReplace:'multiWithReplace',
        customQuery:'customQuery', } 
};

module.exports = { datasourceTypes , executionTypes , };
