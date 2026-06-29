const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../server');
const User = require('../models/User');

const { expect } = chai;
chai.use(chaiHttp);

describe('Auth Routes', () => {
    let findOneStub, createStub, jwtSignStub, bcryptCompareStub;

    beforeEach(() => {
        jwtSignStub = sinon.stub(jwt, 'sign').returns('fake_token');
        findOneStub = sinon.stub(User, 'findOne');
        createStub = sinon.stub(User, 'create');
        bcryptCompareStub = sinon.stub(bcrypt, 'compare');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user and return a token', (done) => {
            findOneStub.resolves(null);
            createStub.resolves({ id: 'user1', name: 'Heer', email: 'heer@test.com', role: 'user' });

            chai.request(app)
                .post('/api/auth/register')
                .send({ name: 'Heer', email: 'heer@test.com', password: 'test123' })
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('token');
                    expect(res.body.email).to.equal('heer@test.com');
                    done();
                });
        });

        it('should return 400 if the user already exists', (done) => {
            findOneStub.resolves({ id: 'user1', email: 'heer@test.com' });

            chai.request(app)
                .post('/api/auth/register')
                .send({ name: 'Heer', email: 'heer@test.com', password: 'test123' })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal('User already exists');
                    done();
                });
        });
    });

    describe('POST /api/auth/login', () => {
        it('should return 401 for an invalid password', (done) => {
            findOneStub.resolves({ id: 'user1', email: 'heer@test.com', password: 'hashed_pw' });
            bcryptCompareStub.resolves(false);

            chai.request(app)
                .post('/api/auth/login')
                .send({ email: 'heer@test.com', password: 'wrongpassword' })
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body.message).to.equal('Invalid email or password');
                    done();
                });
        });
    });
});
