FROM ubuntu:xenial

WORKDIR /root

# Buildroot version to use
ARG RELEASE=2018.02

# configure root password
RUN mkdir /var/run/sshd; \
    echo 'root:unbundeled' | chpasswd; \
    # Install all Buildroot deps
    sed -i 's|deb http://us.archive.ubuntu.com/ubuntu/|deb mirror://mirrors.ubuntu.com/mirrors.txt|g' /etc/apt/sources.list; \
    dpkg --add-architecture i386; \
    apt-get -q update; \
    apt-get purge -q -y snapd lxcfs lxd ubuntu-core-launcher snap-confine;
# install all deps.
RUN apt-get -q -y install build-essential libncurses5-dev \
    git bzr cvs libc6:i386 unzip bc wget openssh-server cpio; \ 
    apt-get -q -y autoremove; \
    apt-get -q -y clean; \
    # Install Buildroot
    wget -c http://buildroot.org/downloads/buildroot-${RELEASE}.tar.gz; \
    tar axf buildroot-${RELEASE}.tar.gz;

# configure the locales
ENV LANG='C' LANGUAGE='en_US:en' LC_ALL='C'

ENV NOTVISIBLE "in users profile"

ENV TERM xtrem

RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config; \
    # SSH login fix. Otherwise user is kicked off after login
    sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd; \
    echo "export VISIBLE=now" >> /etc/profile;

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]
