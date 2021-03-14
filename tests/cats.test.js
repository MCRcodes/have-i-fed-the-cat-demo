const app = require('../src/app');
const { expect } = require('chai');
const request = require('supertest');
const { Cat } = require('../src/models');
const { after } = require('mocha');

describe('/cats', () => {
  before((done) => {
    Cat.sequelize.sync().then(() => done());
  })

  afterEach((done) => {
    Cat.destroy({ where: {} })
    .then(() => done());
  })

  describe('POST', () => {
    it('creates a new cat in the database', (done) => {
      const catData = {
        name: 'Boris',
        breed: 'domestic shorthair',
        markings: 'tuxedo'
      }

      request(app)
        .post('/cats')
        .send(catData)
        .then(({ status, body }) => {
          expect(status).to.equal(201);

          expect(body.name).to.equal(catData.name);
          expect(body.breed).to.equal(catData.breed);
          expect(body.markings).to.equal(catData.markings);
          
          return Cat.findByPk(body.id, { raw: true });
        })
        .then(catDocument => {
          expect(catDocument.name).to.equal(catData.name);
          expect(catDocument.breed).to.equal(catData.breed);
          expect(catDocument.markings).to.equal(catData.markings);
          done();
        })
        .catch(error => done(error));
    });
  });

  describe('with records in the database', () => {
    let cats;

    beforeEach((done) => {
      Promise.all([
        Cat.create({
          name: 'Boris',
          breed: 'domestic shorthair',
          markings: 'tuxedo'
        }),
        Cat.create({
          name: 'Boris',
          breed: 'domestic shorthair',
          markings: 'tuxedo'
        }),
        Cat.create({
          name: 'Boris',
          breed: 'domestic shorthair',
          markings: 'tuxedo'
        })
      ])
      .then((documents) => {
        cats = documents;
        done();
      })
    });

    describe('GET', () => {
      it('returns all records in the database', (done) => {
        request(app)
          .get('/cats')
          .send()
          .then(({ status, body }) => {
            console.log(body);
            expect(status).to.equal(200);
            body.cats.forEach(cat => {
              const expected = cats.find(c => c.id == cat.id).dataValues;
              expect(cat.name).to.deep.equal(expected.name);
              expect(cat.breed).to.deep.equal(expected.breed);
              expect(cat.markings).to.deep.equal(expected.markings);
            });
            done();
          })
          .catch((error) => done(error));
      });
    });
  });
});
