import React, { useRef } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

function limitar(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo);
}

export default function ThickScrollbar({
  contentHeight,
  viewportHeight,
  offset,
  onScrollTo,
}) {
  const maxScroll = Math.max(0, contentHeight - viewportHeight);
  const thumbHeight =
    contentHeight > 0
      ? Math.min(viewportHeight, Math.max(56, (viewportHeight * viewportHeight) / contentHeight))
      : viewportHeight;
  const maxThumbTop = viewportHeight - thumbHeight;
  const progress = maxScroll > 0 ? limitar(offset / maxScroll, 0, 1) : 0;
  const thumbTop = maxThumbTop > 0 ? progress * maxThumbTop : 0;
  const latest = useRef({});
  latest.current = { maxScroll, maxThumbTop, onScrollTo, thumbTop };

  const dragStart = useRef(0);
  const panResponder = useRef(null);
  if (!panResponder.current) {
    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStart.current = latest.current.thumbTop;
      },
      onPanResponderMove: (_, gesture) => {
        const { maxScroll: scrollRange, maxThumbTop: thumbRange, onScrollTo: scrollTo } = latest.current;
        if (thumbRange <= 0) return;
        const nextTop = limitar(dragStart.current + gesture.dy, 0, thumbRange);
        scrollTo((nextTop / thumbRange) * scrollRange);
      },
    });
  }

  if (viewportHeight <= 0 || maxScroll <= 0) return null;

  return (
    <View style={[styles.track, { height: viewportHeight }]} pointerEvents="box-none">
      <View
        {...panResponder.current.panHandlers}
        style={[styles.touchTarget, { height: thumbHeight, top: thumbTop }]}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Barra de rolagem"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round((offset / maxScroll) * 100),
        }}
      >
        <View style={styles.thumb} pointerEvents="none" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: 48, position: 'relative', alignItems: 'center' },
  touchTarget: {
    width: 48,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: { width: 16, height: '100%', borderRadius: 8, backgroundColor: '#687080' },
});
