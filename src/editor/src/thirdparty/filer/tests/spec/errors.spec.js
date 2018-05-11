var Filer = require('../..');
var expect = require('chai').expect;

describe("Filer.Errors", function() {
  it("has expected errors", function() {
    expect(Filer.Errors).to.exist;

    // By ctor -- if you add some to src/errors.js, also add here
    //expect(Filer.Errors.UNKNOWN).to.be.a('function');
    //expect(Filer.Errors.OK).to.be.a('function');
    //expect(Filer.Errors.EOF).to.be.a('function');
    //expect(Filer.Errors.EADDRINFO).to.be.a('function');
    //expect(Filer.Errors.EACCES).to.be.a('function');
    //expect(Filer.Errors.EAGAIN).to.be.a('function');
    //expect(Filer.Errors.EADDRINUSE).to.be.a('function');
    //expect(Filer.Errors.EADDRNOTAVAIL).to.be.a('function');
    //expect(Filer.Errors.EAFNOSUPPORT).to.be.a('function');
    //expect(Filer.Errors.EALREADY).to.be.a('function');
    expect(Filer.Errors.EBADF).to.be.a('function');
    expect(Filer.Errors.EBUSY).to.be.a('function');
    //expect(Filer.Errors.ECONNABORTED).to.be.a('function');
    //expect(Filer.Errors.ECONNREFUSED).to.be.a('function');
    //expect(Filer.Errors.ECONNRESET).to.be.a('function');
    //expect(Filer.Errors.EDESTADDRREQ).to.be.a('function');
    //expect(Filer.Errors.EFAULT).to.be.a('function');
    //expect(Filer.Errors.EHOSTUNREACH).to.be.a('function');
    //expect(Filer.Errors.EINTR).to.be.a('function');
    expect(Filer.Errors.EINVAL).to.be.a('function');
    //expect(Filer.Errors.EISCONN).to.be.a('function');
    //expect(Filer.Errors.EMFILE).to.be.a('function');
    //expect(Filer.Errors.EMSGSIZE).to.be.a('function');
    //expect(Filer.Errors.ENETDOWN).to.be.a('function');
    //expect(Filer.Errors.ENETUNREACH).to.be.a('function');
    //expect(Filer.Errors.ENFILE).to.be.a('function');
    //expect(Filer.Errors.ENOBUFS).to.be.a('function');
    //expect(Filer.Errors.ENOMEM).to.be.a('function');
    expect(Filer.Errors.ENOTDIR).to.be.a('function');
    expect(Filer.Errors.EISDIR).to.be.a('function');
    //expect(Filer.Errors.ENONET).to.be.a('function');
    //expect(Filer.Errors.ENOTCONN).to.be.a('function');
    //expect(Filer.Errors.ENOTSOCK).to.be.a('function');
    //expect(Filer.Errors.ENOTSUP).to.be.a('function');
    expect(Filer.Errors.ENOENT).to.be.a('function');
    //expect(Filer.Errors.ENOSYS).to.be.a('function');
    //expect(Filer.Errors.EPIPE).to.be.a('function');
    //expect(Filer.Errors.EPROTO).to.be.a('function');
    //expect(Filer.Errors.EPROTONOSUPPORT).to.be.a('function');
    //expect(Filer.Errors.EPROTOTYPE).to.be.a('function');
    //expect(Filer.Errors.ETIMEDOUT).to.be.a('function');
    //expect(Filer.Errors.ECHARSET).to.be.a('function');
    //expect(Filer.Errors.EAIFAMNOSUPPORT).to.be.a('function');
    //expect(Filer.Errors.EAISERVICE).to.be.a('function');
    //expect(Filer.Errors.EAISOCKTYPE).to.be.a('function');
    //expect(Filer.Errors.ESHUTDOWN).to.be.a('function');
    expect(Filer.Errors.EEXIST).to.be.a('function');
    //expect(Filer.Errors.ESRCH).to.be.a('function');
    //expect(Filer.Errors.ENAMETOOLONG).to.be.a('function');
    //expect(Filer.Errors.EPERM).to.be.a('function');
    expect(Filer.Errors.ELOOP).to.be.a('function');
    //expect(Filer.Errors.EXDEV).to.be.a('function');
    expect(Filer.Errors.ENOTEMPTY).to.be.a('function');
    //expect(Filer.Errors.ENOSPC).to.be.a('function');
    expect(Filer.Errors.EIO).to.be.a('function');
    //expect(Filer.Errors.EROFS).to.be.a('function');
    //expect(Filer.Errors.ENODEV).to.be.a('function');
    //expect(Filer.Errors.ESPIPE).to.be.a('function');
    //expect(Filer.Errors.ECANCELED).to.be.a('function');
    expect(Filer.Errors.ENOTMOUNTED).to.be.a('function');
    expect(Filer.Errors.EFILESYSTEMERROR).to.be.a('function');
    expect(Filer.Errors.ENOATTR).to.be.a('function');

    // By errno
    //expect(Filer.Errors[-1]).to.equal(Filer.Errors.UNKNOWN);
    //expect(Filer.Errors[0]).to.equal(Filer.Errors.OK);
    //expect(Filer.Errors[1]).to.equal(Filer.Errors.EOF);
    //expect(Filer.Errors[2]).to.equal(Filer.Errors.EADDRINFO);
    //expect(Filer.Errors[3]).to.equal(Filer.Errors.EACCES);
    //expect(Filer.Errors[4]).to.equal(Filer.Errors.EAGAIN);
    //expect(Filer.Errors[5]).to.equal(Filer.Errors.EADDRINUSE);
    //expect(Filer.Errors[6]).to.equal(Filer.Errors.EADDRNOTAVAIL);
    //expect(Filer.Errors[7]).to.equal(Filer.Errors.EAFNOSUPPORT);
    //expect(Filer.Errors[8]).to.equal(Filer.Errors.EALREADY);
    expect(Filer.Errors[9]).to.equal(Filer.Errors.EBADF);
    expect(Filer.Errors[10]).to.equal(Filer.Errors.EBUSY);
    //expect(Filer.Errors[11]).to.equal(Filer.Errors.ECONNABORTED);
    //expect(Filer.Errors[12]).to.equal(Filer.Errors.ECONNREFUSED);
    //expect(Filer.Errors[13]).to.equal(Filer.Errors.ECONNRESET);
    //expect(Filer.Errors[14]).to.equal(Filer.Errors.EDESTADDRREQ);
    //expect(Filer.Errors[15]).to.equal(Filer.Errors.EFAULT);
    //expect(Filer.Errors[16]).to.equal(Filer.Errors.EHOSTUNREACH);
    //expect(Filer.Errors[17]).to.equal(Filer.Errors.EINTR);
    expect(Filer.Errors[18]).to.equal(Filer.Errors.EINVAL);
    //expect(Filer.Errors[19]).to.equal(Filer.Errors.EISCONN);
    //expect(Filer.Errors[20]).to.equal(Filer.Errors.EMFILE);
    //expect(Filer.Errors[21]).to.equal(Filer.Errors.EMSGSIZE);
    //expect(Filer.Errors[22]).to.equal(Filer.Errors.ENETDOWN);
    //expect(Filer.Errors[23]).to.equal(Filer.Errors.ENETUNREACH);
    //expect(Filer.Errors[24]).to.equal(Filer.Errors.ENFILE);
    //expect(Filer.Errors[25]).to.equal(Filer.Errors.ENOBUFS);
    //expect(Filer.Errors[26]).to.equal(Filer.Errors.ENOMEM);
    expect(Filer.Errors[27]).to.equal(Filer.Errors.ENOTDIR);
    expect(Filer.Errors[28]).to.equal(Filer.Errors.EISDIR);
    //expect(Filer.Errors[29]).to.equal(Filer.Errors.ENONET);
    //expect(Filer.Errors[31]).to.equal(Filer.Errors.ENOTCONN);
    //expect(Filer.Errors[32]).to.equal(Filer.Errors.ENOTSOCK);
    //expect(Filer.Errors[33]).to.equal(Filer.Errors.ENOTSUP);
    expect(Filer.Errors[34]).to.equal(Filer.Errors.ENOENT);
    //expect(Filer.Errors[35]).to.equal(Filer.Errors.ENOSYS);
    //expect(Filer.Errors[36]).to.equal(Filer.Errors.EPIPE);
    //expect(Filer.Errors[37]).to.equal(Filer.Errors.EPROTO);
    //expect(Filer.Errors[38]).to.equal(Filer.Errors.EPROTONOSUPPORT);
    //expect(Filer.Errors[39]).to.equal(Filer.Errors.EPROTOTYPE);
    //expect(Filer.Errors[40]).to.equal(Filer.Errors.ETIMEDOUT);
    //expect(Filer.Errors[41]).to.equal(Filer.Errors.ECHARSET);
    //expect(Filer.Errors[42]).to.equal(Filer.Errors.EAIFAMNOSUPPORT);
    //expect(Filer.Errors[44]).to.equal(Filer.Errors.EAISERVICE);
    //expect(Filer.Errors[45]).to.equal(Filer.Errors.EAISOCKTYPE);
    //expect(Filer.Errors[46]).to.equal(Filer.Errors.ESHUTDOWN);
    expect(Filer.Errors[47]).to.equal(Filer.Errors.EEXIST);
    //expect(Filer.Errors[48]).to.equal(Filer.Errors.ESRCH);
    //expect(Filer.Errors[49]).to.equal(Filer.Errors.ENAMETOOLONG);
    //expect(Filer.Errors[50]).to.equal(Filer.Errors.EPERM);
    expect(Filer.Errors[51]).to.equal(Filer.Errors.ELOOP);
    //expect(Filer.Errors[52]).to.equal(Filer.Errors.EXDEV);
    expect(Filer.Errors[53]).to.equal(Filer.Errors.ENOTEMPTY);
    //expect(Filer.Errors[54]).to.equal(Filer.Errors.ENOSPC);
    expect(Filer.Errors[55]).to.equal(Filer.Errors.EIO);
    //expect(Filer.Errors[56]).to.equal(Filer.Errors.EROFS);
    //expect(Filer.Errors[57]).to.equal(Filer.Errors.ENODEV);
    //expect(Filer.Errors[58]).to.equal(Filer.Errors.ESPIPE);
    //expect(Filer.Errors[59]).to.equal(Filer.Errors.ECANCELED);
    expect(Filer.Errors[1000]).to.equal(Filer.Errors.ENOTMOUNTED);
    expect(Filer.Errors[1001]).to.equal(Filer.Errors.EFILESYSTEMERROR);
    expect(Filer.Errors[1002]).to.equal(Filer.Errors.ENOATTR);
  });

  it('should include all expected properties by default', function() {
    var err = new Filer.Errors.ENOENT();
    expect(err.name).to.equal('ENOENT');
    expect(err.code).to.equal('ENOENT');
    expect(err.errno).to.equal(34);
    expect(err.message).to.equal('no such file or directory');
  });

  it('should include extra properties when provided', function() {
    var err = new Filer.Errors.ENOENT('This is the message', '/this/is/the/path');
    expect(err.name).to.equal('ENOENT');
    expect(err.code).to.equal('ENOENT');
    expect(err.errno).to.equal(34);
    expect(err.message).to.equal('This is the message');
    expect(err.path).to.equal('/this/is/the/path');
  });

  it('should include default message and path info when provided', function() {
    var err = new Filer.Errors.ENOENT(null, '/this/is/the/path');
    expect(err.message).to.equal('no such file or directory');
    expect(err.path).to.equal('/this/is/the/path');
  });

  it('should include just the message when no path provided', function() {
    var err = new Filer.Errors.ENOENT();
    expect(err.message).to.equal('no such file or directory');
    expect(err.path).not.to.exist;
  });

  it('should not include path in toString() when not provided', function() {
    var err = new Filer.Errors.ENOENT('This is the message');
    expect(err.toString()).to.equal("ENOENT: This is the message");
  });

  it('should include path in toString() when provided', function() {
    var err = new Filer.Errors.ENOENT(null, '/this/is/the/path');
    expect(err.toString()).to.equal("ENOENT: no such file or directory, '/this/is/the/path'");
  });

  it('should include message and path info when provided', function() {
    var err = new Filer.Errors.ENOENT('This is the message', '/this/is/the/path');
    expect(err.message).to.equal('This is the message');
    expect(err.path).to.equal('/this/is/the/path');
  });
});
