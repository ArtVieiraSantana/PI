import { useCallback, useRef, useState } from 'react';
import ThickScrollbar from '../components/ThickScrollbar';

export default function useThickScrollbar() {
  const scrollRef = useRef(null);
  const [metrics, setMetrics] = useState({ contentHeight: 0, viewportHeight: 0, offset: 0 });

  const onLayout = useCallback((event) => {
    const viewportHeight = event.nativeEvent.layout.height;
    setMetrics((current) => ({ ...current, viewportHeight }));
  }, []);

  const onContentSizeChange = useCallback((_, contentHeight) => {
    setMetrics((current) => ({ ...current, contentHeight }));
  }, []);

  const onScroll = useCallback((event) => {
    const offset = event.nativeEvent.contentOffset.y;
    setMetrics((current) => (current.offset === offset ? current : { ...current, offset }));
  }, []);

  const onScrollTo = useCallback((offset) => {
    const scrollable = scrollRef.current;
    if (typeof scrollable?.scrollToOffset === 'function') {
      scrollable.scrollToOffset({ offset, animated: false });
    } else {
      scrollable?.scrollTo({ y: offset, animated: false });
    }
  }, []);

  return {
    scrollRef,
    scrollProps: {
      onLayout,
      onContentSizeChange,
      onScroll,
      scrollEventThrottle: 32,
      showsVerticalScrollIndicator: false,
    },
    scrollbar: <ThickScrollbar {...metrics} onScrollTo={onScrollTo} />,
  };
}
