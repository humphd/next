#!/bin/sh

# Run after buildroot has built the image, and path to the built
# output/image dir is passed as first arg.  We copy the built ISO
# out of the container.
cp $1/rootfs.iso9660 /build/v86-linux.iso
echo "Created v86-linux.iso.\n"
