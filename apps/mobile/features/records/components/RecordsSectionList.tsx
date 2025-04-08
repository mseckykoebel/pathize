import React, {memo, useCallback, useEffect, useState} from 'react';
import {View, SectionList, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {trigger} from 'react-native-haptic-feedback';
import dayjs from 'dayjs';
import tw from 'twrnc';

import {
  ActivityRecord,
  Crash,
  MedicationRecord,
  SymptomRecord,
} from '@pathize/db';
import {
  getIcon,
  getColorByScore,
  getSymptomSeverityByScore,
  getCrashSeverityByScore,
  getCircular,
} from '../../../utils';
import {numberToStringTime} from '../../../lib';
import {
  Badge,
  Body1,
  ChevronRight,
  Header3,
  PathizeIcon,
} from '@pathize/mobile-ui';
import {useAnalytics} from '../../../hooks';

type RecordsList = {
  title: 'All Day' | 'Morning' | 'Afternoon' | 'Evening';
  data: (Crash | SymptomRecord | MedicationRecord | ActivityRecord)[];
};

const getInTimeFrame = (
  items: (Crash | SymptomRecord | MedicationRecord | ActivityRecord)[],
  hourStart: number,
  hourEnd: number,
): (Crash | SymptomRecord | MedicationRecord | ActivityRecord)[] => {
  // return an array of crashes that happen after hourStart, and before hourEnd
  return items.filter(item => {
    // return if item.activityTotalTime === 1440
    if (
      ('crashTotalTime' in item && item.crashTotalTime === 1440) ||
      ('activityTotalTime' in item && item.activityTotalTime === 1440)
    )
      return false;

    const hour = dayjs(item.time).hour();
    return hour >= hourStart && hour < hourEnd;
  });
};

type RecordsSectionListProps = {
  crashes: Crash[] | null;
  symptoms: SymptomRecord[] | null;
  medicationRecords: MedicationRecord[] | null;
  activityRecords: ActivityRecord[] | null;
};

export const RecordsSectionList: React.FC<RecordsSectionListProps> = memo(
  ({crashes, symptoms, medicationRecords, activityRecords}) => {
    const [recordsList, setRecordsList] = useState<RecordsList[]>([]);
    const {interactionEvent} = useAnalytics();
    const navigation = useNavigation<any>(); // TODO: make this not any

    const getRecordsList = useCallback(() => {
      if (!crashes && !symptoms && !medicationRecords && !activityRecords) {
        setRecordsList([]);
      }
      // append everything to the same array
      let mixedArray: (
        | Crash
        | SymptomRecord
        | MedicationRecord
        | ActivityRecord
      )[] = [
        ...(crashes || []),
        ...(symptoms || []),
        ...(medicationRecords || []),
        ...(activityRecords || []),
      ];

      const sortedRecords = mixedArray!.sort((a, b) => {
        return dayjs(a.time).diff(dayjs(b.time));
      });
      const localRecordsList: RecordsList[] = [];
      const allDayRecords = sortedRecords.filter(
        item =>
          ('crashTotalTime' in item && item.crashTotalTime === 1440) ||
          ('activityTotalTime' in item && item.activityTotalTime === 1440),
      );
      const morningRecords = getInTimeFrame(sortedRecords, 0, 12);
      const afternoonRecords = getInTimeFrame(sortedRecords, 12, 18);
      const eveningRecords = getInTimeFrame(sortedRecords, 18, 24);
      if (allDayRecords.length > 0) {
        localRecordsList.push({
          title: 'All Day',
          data: allDayRecords,
        });
      }
      if (morningRecords.length > 0) {
        localRecordsList.push({
          title: 'Morning',
          data: morningRecords,
        });
      }
      if (afternoonRecords.length > 0) {
        localRecordsList.push({
          title: 'Afternoon',
          data: afternoonRecords,
        });
      }
      if (eveningRecords.length > 0) {
        localRecordsList.push({
          title: 'Evening',
          data: eveningRecords,
        });
      }

      setRecordsList(localRecordsList);
    }, [crashes, medicationRecords, symptoms, activityRecords]);

    useEffect(() => {
      getRecordsList();
    }, [crashes, symptoms, medicationRecords, activityRecords, getRecordsList]);

    const determineIfLastItemInSubarray = useCallback(
      (id: string): boolean => {
        for (const someRecord of recordsList) {
          for (const record of someRecord.data) {
            if (record.id === id) {
              return record === someRecord.data[someRecord.data.length - 1];
            }
          }
        }
        return false;
      },
      [recordsList],
    );

    // TODO: type this better
    const renderItem = ({item}: {item: any}) => {
      return (
        <TouchableOpacity
          key={item.id}
          onPress={() => {
            trigger('impactLight');
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'Home',
              value: item.name,
            });
            if (item.category) {
              navigation.navigate('Symptoms', {
                screen: 'EditSymptomRecord',
                params: {
                  symptom: item,
                },
              });
            } else if (item.medicationName) {
              navigation.navigate('Medications', {
                screen: 'EditMedicationRecord',
                params: {
                  medication: item,
                },
              });
            } else if (item.activityName) {
              navigation.navigate('Activities', {
                screen: 'EditActivityRecord',
                params: {
                  activity: item,
                },
              });
            } else {
              navigation.navigate('Crashes', {
                screen: 'EditCrashRecord',
                params: {
                  crash: item,
                },
              });
            }
          }}>
          <View
            style={tw`flex flex-row ${
              !determineIfLastItemInSubarray(item.id) ? 'mb-2' : ''
            } ${
              determineIfLastItemInSubarray(item.id) &&
              item.activityName &&
              item.activityTotalTime === 1440
                ? 'border-b border-gray-300 pb-4 mb-3'
                : ''
            }`}>
            {/* On the left side */}
            <View style={tw`flex flex-none items-end pt-2`}>
              {/* LOLLIPOP DESIGN */}
              {!determineIfLastItemInSubarray(item.id) && (
                <View
                  style={tw`absolute left-4 top-4 ml-auto ${
                    item.notes || String(item.severity) ? 'h-20' : 'h-14'
                  }  w-0.5 bg-zinc-300`}
                />
              )}
              {/* Now, everything else */}
              <View style={tw`relative flex items-end`}>
                {/* Put a circle in */}
                <View
                  style={tw`rounded-full mb-2 border-2 border-slate-900 bg-white items-center justify-center h-9 w-9`}>
                  <PathizeIcon
                    icon={getIcon(
                      item.category
                        ? item.category
                        : item.activityIcon
                          ? item.activityIcon
                          : !item.medicationName
                            ? 'Crash'
                            : 'Medication',
                    )}
                    size={24}
                  />
                </View>
              </View>
            </View>
            <View style={tw`flex flex-1 justify-center ml-3`}>
              <View style={tw`flex flex-row justify-between items-center`}>
                <View style={tw`flex flex-col justify-center items-start`}>
                  {/* Time */}
                  {
                    // ONLY SHOW IF NOT ALL DAY
                    item.activityTotalTime !== 1440 && (
                      <Body1
                        textStyle={[
                          tw`text-sm text-neutral-500`,
                          getCircular('Book'),
                        ]}
                        text={dayjs(item.time).format('h:mm A')}
                      />
                    )
                  }
                  <Header3
                    textStyle={[
                      tw`text-lg font-semibold w-70`,
                      getCircular('Book'),
                    ]}
                    text={
                      item.name
                        ? item.name
                        : item.activityName
                          ? item.activityName
                          : item.medicationName
                            ? item.medicationName
                            : 'Crash'
                    }
                  />
                  <View style={tw`flex flex-row items-center mt-1`}>
                    {item.notes ? (
                      <Badge
                        style={tw`mr-1`}
                        text="Notes"
                        rounded="large"
                        textColor="text-zinc-900"
                        badgeBackgroundColor="bg-blue-100"
                        textStyle={[
                          tw`text-zinc-900 text-sm font-medium`,
                          getCircular('Book'),
                        ]}
                      />
                    ) : null}
                    {item.severity > -1 &&
                      (getSymptomSeverityByScore(item.severity) !== '-' &&
                      getCrashSeverityByScore(item.severity) !== '-' ? (
                        <Badge
                          style={tw`mr-1`}
                          text={
                            item.symptomId
                              ? getSymptomSeverityByScore(item.severity)
                              : getCrashSeverityByScore(item.severity)
                          }
                          rounded="large"
                          textColor="text-zinc-800"
                          badgeBackgroundColor={
                            item.symptomId
                              ? getColorByScore(item.severity)
                              : getColorByScore(item.severity)
                          }
                          textStyle={[
                            tw`text-zinc-900 text-sm font-medium`,
                            getCircular('Book'),
                          ]}
                        />
                      ) : null)}
                    {item.activityTotalTime ? (
                      <Badge
                        style={tw`mr-1`}
                        text={numberToStringTime(item.activityTotalTime)}
                        rounded="large"
                        textColor="text-zinc-900"
                        badgeBackgroundColor="bg-green-200"
                        textStyle={[
                          tw`text-zinc-900 text-sm font-medium`,
                          getCircular('Book'),
                        ]}
                      />
                    ) : null}
                  </View>
                </View>
                <View style={tw`flex flex-row`}>
                  <View style={tw`flex flex-row items-center`}>
                    <ChevronRight size={18} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    };

    const renderSectionHeader = ({section}: {section: RecordsList}) => {
      return (
        <Body1
          text={section.title}
          textStyle={[
            tw`mb-1 mt-3 text-sm text-neutral-500`,
            getCircular('Book'),
          ]}
        />
      );
    };

    return (
      <SectionList
        scrollEnabled={false}
        sections={recordsList}
        keyExtractor={(item, index) => item.time + index}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
      />
    );
  },
);

RecordsSectionList.displayName = 'RecordsSectionList';
