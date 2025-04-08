import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import {faChevronDown, faRefresh} from '@fortawesome/free-solid-svg-icons';
import {PanGestureHandler} from 'react-native-gesture-handler';
import {TouchableOpacity} from '@gorhom/bottom-sheet';
import Animated, {
  WithSpringConfig,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import dayjs from 'dayjs';
import tw from 'twrnc';

import {
  Badge,
  Body1,
  FadeInFadeOut,
  PathizeIcon,
  FadeIn,
} from '@pathize/mobile-ui';
import {useTodayDataContext} from '../../contexts';
import {getCircular} from '../../utils';
import {useLimitContext, useTerraContext} from '../../contexts';
import {usePathizeSelectedDayContext} from '../../contexts/PathizeSelectedDayContext';
import {DayPicker} from '../home';

type SheetPositions = 'minimized' | 'expanded';

const NAV_HEIGHT = 48;

const DayPickerSheet: React.FC = () => {
  const {today, actuallyToday} = useTodayDataContext();
  const {
    updatePathizeSelectedDay,
    state: {lastUpdated},
  } = usePathizeSelectedDayContext();
  const {limit} = useLimitContext();
  const {terraDevice} = useTerraContext();

  const [, setExpanded] = useState(false);

  const minHeight = 20;
  const expandedHeight = minHeight * 6;

  const position = useSharedValue<SheetPositions>('minimized');
  const sheetHeight = useSharedValue(minHeight);
  const navHeight = useSharedValue(0);

  const springConfig: WithSpringConfig = {
    damping: 50,
    mass: 0.3,
    stiffness: 120,
    overshootClamping: true,
    restSpeedThreshold: 0.3,
    restDisplacementThreshold: 0.3,
  };

  const DRAG_BUFFER = 40;

  const onGestureEvent = useAnimatedGestureHandler({
    // Set the context value to the sheet's current height value
    onStart: (_ev, ctx: any) => {
      ctx.offsetY = sheetHeight.value;
    },
    // Update the sheet's height value based on the gesture
    onActive: (ev, ctx: any) => {
      sheetHeight.value = ctx.offsetY + ev.translationY;
    },
    // Snap the sheet to the correct position once the gesture ends
    onEnd: () => {
      // 'worklet' directive is required for animations to work based on shared values
      'worklet';
      // Snap to expanded position if the sheet is dragged up from minimised position
      // or dragged down from maximised position
      const shouldExpand =
        position.value === 'minimized' &&
        sheetHeight.value > minHeight - DRAG_BUFFER;
      // Snap to minimised position if the sheet is dragged down from expanded position
      const shouldMinimise =
        position.value === 'expanded' &&
        sheetHeight.value < expandedHeight + DRAG_BUFFER;
      // Update the sheet's position with spring animation
      if (shouldExpand) {
        navHeight.value = withSpring(0, springConfig);
        sheetHeight.value = withSpring(expandedHeight, springConfig);
        position.value = 'expanded';
      } else if (shouldMinimise) {
        navHeight.value = withSpring(0, springConfig);
        sheetHeight.value = withSpring(minHeight, springConfig);
        position.value = 'minimized';
      } else {
        sheetHeight.value = withSpring(
          position.value === 'expanded' ? expandedHeight : minHeight,
          springConfig,
        );
      }
    },
  });

  const sheetHeightAnimatedStyle = useAnimatedStyle(() => ({
    height: sheetHeight.value,
  }));

  const sheetContentAnimatedStyle = useAnimatedStyle(() => ({
    paddingTop: position.value === 'expanded' ? 15 : 0,
    paddingBottom: position.value === 'expanded' ? 20 : 10,
    marginHorizontal: 'auto',
    paddingHorizontal: 20,
  }));

  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={() =>
          setExpanded(position.value === 'expanded' ? true : false)
        }>
        <Animated.View style={[sheetHeightAnimatedStyle, styles.sheet]}>
          <Animated.View style={sheetContentAnimatedStyle}>
            <View>
              {/* IF EXPANDED, FADE IN THE DAY PICKER. ELSE, JUST SHOW THE CURRENT DAY */}
              {position.value === 'expanded' ? (
                <FadeInFadeOut
                  watchValue={position.value === 'expanded'}
                  duration={200}>
                  <DayPicker />
                </FadeInFadeOut>
              ) : (
                <FadeIn duration={200}>
                  <View
                    style={[
                      tw`flex flex-row mb-1 ${
                        actuallyToday === today && terraDevice && lastUpdated
                          ? 'justify-between'
                          : 'justify-center'
                      } items-center`,
                    ]}>
                    {/* LEFT SIDE CURRENT DATE */}
                    <View
                      style={[tw`flex flex-row justify-between items-center`]}>
                      <Body1
                        text={dayjs(today).format('dddd, MMMM D')}
                        textStyle={[tw`text-sm`, getCircular('Book')]}
                      />
                      <PathizeIcon
                        icon={faChevronDown}
                        size={12}
                        style={[tw`ml-1`]}
                      />
                    </View>
                    {/* RIGHT SIDE LAST UPDATED*/}
                    {lastUpdated &&
                      actuallyToday === today &&
                      limit &&
                      terraDevice && (
                        <TouchableOpacity
                          style={[tw`flex flex-row justify-center`]}
                          onPress={async () => {
                            trigger('impactLight');
                            await updatePathizeSelectedDay(today, limit, true);
                            return;
                          }}>
                          <Badge
                            text={`Last updated: ${
                              lastUpdated
                                ? dayjs(lastUpdated).format('h:mm A')
                                : '-'
                            }`}
                            textStyle={[tw``, getCircular('Book')]}
                            iconChild={
                              <PathizeIcon
                                icon={faRefresh}
                                size={12}
                                style={[tw``]}
                              />
                            }
                          />
                        </TouchableOpacity>
                      )}
                  </View>
                </FadeIn>
              )}
            </View>
          </Animated.View>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  // The sheet is positioned absolutely to sit at the bottom of the screen
  container: {
    alignSelf: 'flex-start',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  sheet: {
    justifyContent: 'flex-end',
    backgroundColor: '#ffffff',
    minHeight: 60,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    shadowColor: '#065f46',
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  handleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -6,
    paddingBottom: 10,
  },
  // Add a small handle component to indicate the sheet can be dragged
  handle: {
    width: '5%',
    height: 4,
    borderRadius: 8,
    backgroundColor: '#94a3b8',
  },
  closeButton: {
    width: NAV_HEIGHT,
    height: NAV_HEIGHT,
    borderRadius: NAV_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
});

DayPickerSheet.displayName = 'DayPickerSheet';

export default DayPickerSheet;
