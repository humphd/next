#!/bin/sh
set -e

# Build our v86 defconfig
echo $PWD
make BR2_EXTERNAL=/buildroot-v86 v86_defconfig && make
