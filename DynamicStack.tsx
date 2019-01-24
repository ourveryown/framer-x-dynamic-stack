import * as React from "react";
import { PropertyControls, ControlType, Frame, Scroll } from "framer";

enum Direction {
  Vertical = "vertical",
  Horizontal = "horizontal"
}

enum Alignment {
  Start = "start",
  Center = "center",
  End = "end"
}

interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface Props {
  items: React.Component[]; // the frames to be displayed in in the stack
  visibleItems: boolean[]; // array of booleans for whether each frame in the stack should be visible
  gap: number; // the number of pixels seperating each item in the stack
  direction: Direction; // the direction of the stack
  alignment: Alignment; // how items will be aligned in the axis perpindicular to the direction of the stack
  scrollable: boolean; // whether or not to embed the stack content inside of a scroll view

  paddingUniversal: number; // padding to be applied to all side if `paddingPerSide` is false
  paddingPerSide: boolean; // whether `universalPadding` should be used for padding or `paddingTop`, `paddingLeft`...
  paddingTop: number;
  paddingRight: number;
  paddingLeft: number;
  paddingBottom: number;

  width: number;
  height: number;
}

/**
 * @description Default content, shown when a component has no connected frames
 */
export const DefaultContent = () => {
  return (
    <div
      style={{
        height: "100%",
        background: "rgb(255, 170, 34)",
        color: "rgba(0, 0, 0, 1)",
        padding: 10,
        textAlign: "center",
        fontSize: 14
      }}
    >
      <div>
        <b>1.</b> Connect to items.
      </div>
      <div>
        <b>2.</b> Override the `visibleItems` prop to control which items are
        shown
      </div>
    </div>
  );
};

/**
 * @description Provides an alternative to the Stack component where items can be hidden via code overrides by setting the `visibleItems` prop.
 */
export class DynamicStack extends React.Component<Props> {
  static defaultProps = {
    gap: 10,
    direction: Direction.Vertical,
    alignment: Alignment.Center,
    scrollable: true,

    paddingUniversal: 0,
    paddingPerSide: false,
    paddingTop: 0,
    paddingRight: 0,
    paddingLeft: 0,
    paddingBottom: 0,
    height: 400,
    width: 250
  };

  static propertyControls: PropertyControls = {
    scrollable: {
      type: ControlType.Boolean,
      title: "Scrollable"
    },
    direction: {
      type: ControlType.SegmentedEnum,
      options: [Direction.Horizontal, Direction.Vertical],
      title: "Direction",
      defaultValue: "vertical"
    },
    alignment: {
      type: ControlType.SegmentedEnum,
      options: [Alignment.Start, Alignment.Center, Alignment.End],
      optionTitles: props =>
        props.direction === Direction.Vertical
          ? ["Left", "Center", "Right"]
          : ["Top", "Center", "Bottom"],
      title: "Align",
      defaultValue: "start"
    },
    items: {
      type: ControlType.Array,
      title: "Items",
      propertyControl: { type: ControlType.ComponentInstance },
      defaultValue: []
    },
    visibleItems: {
      type: ControlType.Array,
      title: "Visible Items",
      propertyControl: { type: ControlType.Boolean },
      defaultValue: []
    },
    gap: {
      type: ControlType.Number,
      title: "Gap",
      default: 17,
      min: 0,
      step: 1
    },
    paddingUniversal: {
      type: ControlType.FusedNumber,
      toggleKey: "paddingPerSide",
      toggleTitles: ["Padding", "Padding per side"],
      valueKeys: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
      valueLabels: ["t", "r", "b", "l"],
      min: 0,
      title: "Padding",
      defaultValue: 0
    }
  };

  padding = (): Padding => {
    const {
      paddingUniversal,
      paddingPerSide,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft
    } = this.props;

    return paddingPerSide
      ? {
          top: paddingTop,
          right: paddingRight,
          bottom: paddingBottom,
          left: paddingLeft
        }
      : {
          top: paddingUniversal,
          right: paddingUniversal,
          bottom: paddingUniversal,
          left: paddingUniversal
        };
  };

  distanceFromEdgeInStackDirection = (
    index: number,
    items: React.Component[],
    gap: number,
    padding: Padding,
    direction: Direction
  ): number => {
    const itemsBeforeIndex = items.slice(0, index);

    return direction === Direction.Vertical
      ? itemsBeforeIndex.reduce(
          (top: Number, item) => top + item.props.height + gap,
          padding.top
        )
      : itemsBeforeIndex.reduce(
          (left: Number, item) => left + item.props.width + gap,
          padding.left
        );
  };

  distanceFromEdgePerpindicularToStackDirection = (
    itemDimension: number,
    stackDimension: number,
    alignment: Alignment,
    padding: Padding,
    direction: Direction
  ): number => {
    switch (alignment) {
      case Alignment.Start: {
        return direction === Direction.Vertical ? padding.top : padding.left;
      }
      case Alignment.Center: {
        return Math.max((stackDimension - itemDimension) / 2, 0);
      }
      case Alignment.End: {
        return Math.max(
          stackDimension -
            itemDimension -
            (Direction.Vertical ? padding.right : padding.bottom) / 2,
          0
        );
      }
    }
  };

  filterOutHiddenItems = (
    items: React.Component[],
    visibleItems: boolean[]
  ): React.Component[] => {
    return items.filter(
      (_, index) => (index < visibleItems.length ? visibleItems[index] : true) //TODO: fix this
    );
  };

  stackContentHeight = (
    items: React.Component[],
    gap: number,
    direction: Direction,
    padding: Padding
  ): number => {
    return direction === Direction.Vertical
      ? items.reduce(
          (acc: number, item: React.Component) => acc + item.props.height,
          padding.top + padding.bottom + Math.max((items.length - 1) * gap, 0)
        )
      : items.reduce(
          (acc: number, item: React.Component) => acc + item.props.width,
          padding.left + padding.right + Math.max((items.length - 1) * gap, 0)
        );
  };

  render() {
    const {
      items,
      visibleItems,
      gap,
      width: stackWidth,
      height: stackHeight,
      direction,
      alignment,
      scrollable
    } = this.props;
    const padding = this.padding();

    if (items.length === 0) {
      return <DefaultContent />;
    } else {
      const filteredItems = this.filterOutHiddenItems(items, visibleItems);

      const stackFrame = (
        <Frame
          height={
            direction === Direction.Vertical
              ? Math.max(
                  this.stackContentHeight(
                    filteredItems,
                    gap,
                    direction,
                    padding
                  ),
                  stackHeight
                )
              : stackHeight
          }
          width={
            direction === Direction.Horizontal
              ? Math.max(
                  this.stackContentHeight(
                    filteredItems,
                    gap,
                    direction,
                    padding
                  ),
                  stackWidth
                )
              : stackWidth
          }
          background="none"
          top={0}
          left={0}
        >
          {filteredItems.map((item, index) => {
            return React.cloneElement(item, {
              left:
                direction === Direction.Vertical
                  ? this.distanceFromEdgePerpindicularToStackDirection(
                      item.props.width,
                      stackWidth,
                      alignment,
                      padding,
                      direction
                    )
                  : this.distanceFromEdgeInStackDirection(
                      index,
                      filteredItems,
                      gap,
                      padding,
                      direction
                    ),
              top:
                direction === Direction.Vertical
                  ? this.distanceFromEdgeInStackDirection(
                      index,
                      filteredItems,
                      gap,
                      padding,
                      direction
                    )
                  : this.distanceFromEdgePerpindicularToStackDirection(
                      item.props.height,
                      stackHeight,
                      alignment,
                      padding,
                      direction
                    )
            });
          })}
        </Frame>
      );

      return scrollable ? (
        <Scroll height={stackHeight} width={stackWidth} top={0} left={0}>
          {stackFrame}
        </Scroll>
      ) : (
        stackFrame
      );
    }
  }
}
