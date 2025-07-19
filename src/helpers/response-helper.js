'use strict';

function ResponseEntity() {
    this.data = [];
    this.error = false;
    this.message = 'Success';
    this.code = 200;
}

module.exports.ResponseEntity = ResponseEntity;
