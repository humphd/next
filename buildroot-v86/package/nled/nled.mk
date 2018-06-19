################################################################################
#
# nled
#
################################################################################

NLED_VERSION = 2.52
NLED_SITE = https://cdot.senecacollege.ca/software/nled
NLED_SOURCE = nled_2_52_src.tgz
NLED_LICENSE = GPL

define NLED_BUILD_CMDS
	$(TARGET_MAKE_ENV) $(MAKE) -C $(@D)
endef

define NLED_INSTALL_TARGET_CMDS
	install -m755 "$(TARGET_MAKE_ENV)/nled" "$(TARGET_DIR)"
endef

$(eval $(generic-package))
