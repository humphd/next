FROM ubuntu:xenial

WORKDIR /root

# Buildroot version to use
ARG RELEASE=2018.02

RUN mkdir /var/run/sshd
RUN echo 'root:unbundeled' | chpasswd

# Install all Buildroot deps
RUN sed -i 's|deb http://us.archive.ubuntu.com/ubuntu/|deb mirror://mirrors.ubuntu.com/mirrors.txt|g' /etc/apt/sources.list
RUN apt-get update
RUN dpkg --add-architecture i386
RUN apt-get -q update
RUN apt-get purge -q -y snapd lxcfs lxd ubuntu-core-launcher snap-confine
RUN apt-get -q -y install build-essential libncurses5-dev \
    git bzr cvs libc6:i386 unzip bc wget openssh-server
RUN apt-get -q -y autoremove
RUN apt-get -q -y clean

RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile

# configure the locales
ENV LANG='C' LANGUAGE='en_US:en' LC_ALL='C'

EXPOSE 22

# Install Buildroot
RUN wget -c http://buildroot.org/downloads/buildroot-${RELEASE}.tar.gz
RUN tar axf buildroot-${RELEASE}.tar.gz

CMD ["/usr/sbin/sshd", "-D"]
