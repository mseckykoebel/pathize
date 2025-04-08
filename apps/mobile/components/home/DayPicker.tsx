import React, {useEffect, memo, useMemo, useCallback} from 'react';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import dayjs from 'dayjs';
import tw from 'twrnc';

import {usePathizeDataContext, useTodayDataContext} from '../../contexts';
import {getCircular} from '../../utils';
import {useAnalytics} from '../../hooks';

const monthDict = {
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Aug',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec',
};

type Day = {
  id: string;
  day: string;
};

const Item = memo(({item, onPress, borderColor, backgroundColor}: any) => {
  const monthPortion = item.day.split('-')[1];
  let dayPortion = item.day.split('-')[2];
  let day: string | null = monthDict[monthPortion as keyof typeof monthDict];

  // if today matches the day portion, set dayPortion to be 'Today'
  if (dayjs().format('YYYY-MM-DD') === item.day) {
    dayPortion = 'Today';
    day = null;
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={tw`pb-4 pt-1 w-18`}>
        <View
          style={tw`rounded-lg shadow-md border-2 ${borderColor} ${backgroundColor} items-center justify-center h-15 w-13`}>
          {day && (
            <Text
              style={[
                tw`text-sm font-normal -mb-1 text-slate-900`,
                getCircular('Book'),
              ]}>
              {day}
            </Text>
          )}
          <Text
            style={[
              tw`text-sm font-normal text-slate-900`,
              getCircular('Book'),
            ]}>
            {dayPortion}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export const DayPicker = () => {
  const {selectedId, setSelectedId, actuallyToday, setToday} =
    useTodayDataContext();
  const {dispatch} = usePathizeDataContext();
  const {interactionEvent} = useAnalytics();

  // TODO: this might need to be updated to trigger a day change/update of the days data
  const daysData = useMemo(() => {
    const today = dayjs();
    return Array.from({length: 180}, (_, i) => {
      const tempDay = dayjs(today).subtract(i, 'day').format('YYYY-MM-DD');
      return {
        id: i.toString(),
        day: tempDay,
      };
    }) as Day[];
  }, []);

  /**
   * @description Logic that updates the selectedId when the user opens the app
   */
  const findAndSetCorrectDay = useCallback(() => {
    const today = daysData.find(day => day.id === selectedId);
    if (today) return today.day;
  }, [daysData, selectedId]);

  /**
   * @description This useEffect updates today, which in turn triggers a re-render of various components
   */
  useEffect(() => {
    const handleDayChange = async () => {
      const foundDay = findAndSetCorrectDay();
      if (foundDay) {
        setToday(foundDay);
      } else {
        dispatch({type: 'SET_DATA', payload: {initialized: false}});
        setToday(actuallyToday);
      }
      console.log('🧮 DAY HAS BEEN UPDATED: ', foundDay ?? actuallyToday);
    };

    handleDayChange();
  }, [actuallyToday, setToday, findAndSetCorrectDay, dispatch]);

  const renderItem = ({item}: any) => {
    const backgroundColor = item.id === selectedId ? 'bg-white' : 'bg-white';
    const borderColor =
      item.id === selectedId ? 'border-slate-900' : 'border-zinc-300';

    return (
      <Item
        item={item}
        onPress={() => {
          interactionEvent('Button', 'Pressed', {
            $screen_name: 'Home',
            value: item.day,
          });
          trigger('impactLight');
          setSelectedId(item.id);
        }}
        borderColor={borderColor}
        backgroundColor={backgroundColor}
      />
    );
  };

  return (
    <View style={tw`flex-row justify-center mt-3`}>
      <FlatList
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        data={daysData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        extraData={selectedId}
        inverted={true}
      />
    </View>
  );
};
