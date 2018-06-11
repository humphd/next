FROM rastasheep/ubuntu-sshd:16.04

WORKDIR /root

# Buildroot version to use
ARG BUILD_ROOT_RELEASE=2018.02

# configure root password
RUN echo 'root:unbundeled' | chpasswd; \
    # Install all Buildroot deps
    sed -i 's|deb http://us.archive.ubuntu.com/ubuntu/|deb mirror://mirrors.ubuntu.com/mirrors.txt|g' /etc/apt/sources.list; \
    dpkg --add-architecture i386; \
    apt-get -q update; \
    apt-get purge -q -y snapd lxcfs lxd ubuntu-core-launcher snap-confine;
# install all deps.
RUN apt-get -q -y install build-essential libncurses5-dev \
    git bzr cvs libc6:i386 unzip bc wget cpio libssl-dev; \ 
    apt-get -q -y autoremove; \
    apt-get -q -y clean; \
    # Install Buildroot
    wget -c http://buildroot.org/downloads/buildroot-${BUILD_ROOT_RELEASE}.tar.gz; \
    tar axf buildroot-${BUILD_ROOT_RELEASE}.tar.gz;

# configure the locales
ENV LANG='C' \
    LANGUAGE='en_US:en' \
    LC_ALL='C' \ 
    NOTVISIBLE="in users profile" \
    TERM=xterm

VOLUME /buildroot-ext-tree
VOLUME /build

WORKDIR /root/buildroot-${BUILD_ROOT_RELEASE}
ENTRYPOINT ["/buildroot-ext-tree/build-v86.sh"]
