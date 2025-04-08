import React, { Dispatch, SetStateAction, memo } from "react";
import { SectionList, StyleProp, TextStyle, ViewStyle } from "react-native";
import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { tw } from "../../lib";

import { ListItem } from "./ListItem";
import { Header3 } from "../text/Header3";
import { PathizeIcon } from "../icons/PathizeIcon";

type Data = { sectionTitle: string; data: string[] }[];

type Props = {
  sectionsData: Data;
  scrollEnabled?: boolean;
  iconExtractor: (item: string) => IconDefinition;
  titleStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  setSelectedItem?: Dispatch<SetStateAction<string>>;
  padding?: boolean;
  hapticFeedback?: boolean;
  buttonStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

/**
 * @description CategoryList inheres the properties of ListItem except for title and badgeChild
 * @param sectionCategories the list of categories to display
 * @param style the overall style of the list container
 */
export const CategoryList: React.FC<Props> = memo(
  ({
    sectionsData,
    scrollEnabled = false,
    iconExtractor,
    style = {},
    onPress,
    setSelectedItem,
    ...props
  }) => {
    return (
      <SectionList
        scrollEnabled={scrollEnabled}
        sections={sectionsData}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => {
          return (
            <ListItem
              onPress={() => {
                console.log("Item pressed:", item);
                setSelectedItem && setSelectedItem(item);
                onPress && onPress();
              }}
              title={item}
              itemIcon={<PathizeIcon icon={iconExtractor(item)} size={24} />}
              {...props}
            />
          );
        }}
        renderSectionHeader={({ section: { sectionTitle } }) => (
          <Header3
            text={sectionTitle}
            textStyle={[tw`my-1`, props.titleStyle]}
          />
        )}
        style={[tw``, style]}
      />
    );
  }
);

CategoryList.displayName = "CategoryList";
