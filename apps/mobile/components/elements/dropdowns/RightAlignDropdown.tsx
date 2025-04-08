import React, {useState, useRef, Dispatch, SetStateAction} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  StyleProp,
  ViewStyle,
  TouchableWithoutFeedback,
} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import {faCheck, faChevronDown} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {Portal} from '@gorhom/portal';
import tw from 'twrnc';
import {useAnalytics} from '../../../hooks';

export type DropdownItem = {id: string; name: string};

type Props = {
  text: string;
  items: {id: string; name: string}[];
  selectedItem: {id: string; name: string};
  setSelectedItem: Dispatch<SetStateAction<{id: string; name: string} | null>>;
  style?: StyleProp<ViewStyle>;
};

export const RightAlignDropdown: React.FC<Props> = ({
  text,
  items,
  selectedItem,
  setSelectedItem,
  style = {},
}) => {
  const {interactionEvent} = useAnalytics();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({x: 0, y: 0, width: 0, height: 0});
  const rotateAnim = new Animated.Value(0);
  const buttonRef = useRef<View | null>(null);

  const rotateIcon = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const toggleDropdown = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setIsOpen(!isOpen);
      setPosition({x, y, width, height});
    });
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[style]} ref={buttonRef}>
      <TouchableOpacity
        style={tw`flex-row justify-center items-center px-3 py-2`}
        onPress={() => {
          trigger('impactLight');
          toggleDropdown();
        }}>
        <Text style={tw`mr-1 font-semibold text-gray-700`}>{text}</Text>
        <Animated.View style={{transform: [{rotate: rotateIcon}]}}>
          <FontAwesomeIcon icon={faChevronDown} color={'#95DAB2'} size={14} />
        </Animated.View>
      </TouchableOpacity>

      {isOpen && (
        <Portal>
          <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
            <View style={tw`absolute top-0 right-0 bottom-0 left-0`} />
          </TouchableWithoutFeedback>
          <View
            style={[
              tw`w-60 bg-white rounded-md shadow-lg p-2`,
              {
                position: 'absolute',
                top: position.y + position.height + 10,
                right: 30,
              },
            ]}>
            {items.map(item => {
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    interactionEvent('Item', 'Selected', {
                      value: item.name,
                    });
                    trigger('impactLight');
                    setSelectedItem(item);
                  }}
                  style={tw`rounded-md`}>
                  <View
                    style={tw`flex flex-row justify-between items-center p-3 rounded-md flex-wrap`}>
                    <Text style={tw`text-sm font-normal text-gray-700 flex-1`}>
                      {item.name}
                    </Text>
                    {selectedItem?.id === item.id ? (
                      <FontAwesomeIcon
                        icon={faCheck}
                        size={20}
                        color="#065f46"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faCheck}
                        size={20}
                        color="#065f46"
                        style={tw`opacity-40`}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Portal>
      )}
    </View>
  );
};
