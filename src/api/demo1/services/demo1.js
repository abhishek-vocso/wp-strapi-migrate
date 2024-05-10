'use strict';

/**
 * demo1 service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::demo1.demo1');
