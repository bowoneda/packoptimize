var e = process.env;
console.error('PORT=' + e.PORT);
console.error('DB=' + (e.DATABASE_URL ? 'set' : 'MISSING'));
console.error('JWT=' + (e.JWT_SECRET ? 'set' : 'MISSING'));
console.error('REDIS=' + (e.REDIS_URL ? 'set' : 'MISSING'));
console.error('NODE_ENV=' + e.NODE_ENV);
console.error('Now starting app...');
require('./dist/main');
