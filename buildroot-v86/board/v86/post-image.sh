#!/bin/sh

# Run after buildroot has built the image, and path to the built
# output/image dir is passed as first arg.  We copy the built ISO
# out of the container.
cp ${BINARIES_DIR}/rootfs.iso9660 /build/v86-linux.iso
echo "Created v86-linux.iso.\n"

tar czvf /build/licenses.tar.gz \
    ${BASE_DIR}/legal-info/buildroot.config \
    ${BASE_DIR}/legal-info/host-licenses \
    ${BASE_DIR}/legal-info/licenses
echo "Created license.tar.gz"
