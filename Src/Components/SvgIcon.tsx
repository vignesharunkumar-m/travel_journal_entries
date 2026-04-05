import { TouchableOpacity } from 'react-native';
import React from 'react';

import { ICONS } from '../Utility/Icons';
import { COLORS } from '../Utility/Colors';
import { SVGIconProps } from '../@types/components';
import { ACTIVE_OPACITY } from '../Utility/Constants';

const SvgIcon = ({
  size = 22,
  icon,
  isButton = false,
  onPress,
  fill = COLORS.transparent,
  iconStyle = {},
  style,
}: SVGIconProps) => {
  const Icon = icon ? ICONS[icon] : false;

  if (!Icon) {
    return null;
  }
  return (
    <TouchableOpacity
      style={[style]}
      disabled={!isButton}
      activeOpacity={ACTIVE_OPACITY}
      onPress={onPress}
    >
      <Icon width={size} height={size} style={[iconStyle]} fill={fill} />
    </TouchableOpacity>
  );
};

export default SvgIcon;
