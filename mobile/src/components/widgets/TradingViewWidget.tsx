import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity, Text, Modal, FlatList } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type WidgetType = 
  | 'advanced-chart'
  | 'chart'
  | 'ticker'
  | 'ticker-tape'
  | 'mini-chart'
  | 'market-overview'
  | 'screener'
  | 'crypto-screener'
  | 'hotlists'
  | 'economic-calendar'
  | 'stock-heatmap'
  | 'crypto-heatmap'
  | 'forex-heatmap'
  | 'technical-analysis'
  | 'symbol-info';

type Props = {
  type: WidgetType;
  symbol?: string;
  height?: number;
  symbols?: string[];
  allowPairChange?: boolean;
  onPairChange?: (symbol: string) => void;
};

const POPULAR_PAIRS = [
  { symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin' },
  { symbol: 'BINANCE:ETHUSDT', name: 'Ethereum' },
  { symbol: 'FX:EURUSD', name: 'EUR/USD' },
  { symbol: 'FX:GBPUSD', name: 'GBP/USD' },
  { symbol: 'OANDA:XAUUSD', name: 'Gold' },
  { symbol: 'OANDA:XAGUSD', name: 'Silver' },
  { symbol: 'SPX500', name: 'S&P 500' },
  { symbol: 'NAS100', name: 'Nasdaq' },
];

export default function TradingViewWidget({ type, symbol = 'BTCUSDT', height, symbols, allowPairChange = false, onPairChange }: Props) {
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [currentSymbol, setCurrentSymbol] = useState(symbol);
  const [showPairPicker, setShowPairPicker] = useState(false);

  const getPreferredHeight = (widgetType: WidgetType) => {
    switch (widgetType) {
      case 'ticker-tape':
        return 46;
      case 'advanced-chart':
        return Math.max(720, SCREEN_HEIGHT - 180);
      case 'mini-chart':
        return 320;
      case 'symbol-info':
        return 360;
      case 'technical-analysis':
        return 420;
      case 'market-overview':
      case 'screener':
      case 'crypto-screener':
      case 'economic-calendar':
      case 'stock-heatmap':
      case 'crypto-heatmap':
      case 'forex-heatmap':
      case 'hotlists':
        return 520;
      default:
        return 300;
    }
  };

  const resolvedHeight = height ?? getPreferredHeight(type);

  const handlePairChange = (newSymbol: string) => {
    setCurrentSymbol(newSymbol);
    onPairChange?.(newSymbol);
    setShowPairPicker(false);
  };

  const getWidgetHtml = () => {
    const theme = isDark ? 'dark' : 'light';
    const bgColor = isDark ? '000000' : 'ffffff';
    const widgetHeight = resolvedHeight;
    
    switch (type) {
      case 'chart':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
            <style>body{margin:0;padding:0;overflow:hidden;}</style>
          </head>
          <body>
            <div class="tradingview-widget-container" style="height:100%;width:100%">
              <div id="tradingview_chart" style="height:100%;width:100%"></div>
            </div>
            <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
            <script type="text/javascript">
              new TradingView.widget({
                "autosize": true,
                "symbol": "${currentSymbol}",
                "interval": "60",
                "timezone": "Etc/UTC",
                "theme": "${theme}",
                "style": "1",
                "locale": "en",
                "toolbar_bg": "#${bgColor}",
                "enable_publishing": false,
                "hide_top_toolbar": false,
                "hide_legend": false,
                "save_image": false,
                "container_id": "tradingview_chart",
                "hide_volume": true
              });
            </script>
          </body>
          </html>
        `;
      
      case 'ticker':
        const tickerSymbols = symbols || ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'FX:EURUSD', 'OANDA:XAUUSD'];
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>body{margin:0;padding:0;}</style>
          </head>
          <body>
            <div class="tradingview-widget-container">
              <div class="tradingview-widget-container__widget"></div>
              <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js" async>
              {
                "symbols": ${JSON.stringify(tickerSymbols.map(s => ({ proName: s, title: s.split(':')[1] || s })))},
                "showSymbolLogo": true,
                "colorTheme": "${theme}",
                "isTransparent": false,
                "displayMode": "adaptive",
                "locale": "en"
              }
              </script>
            </div>
          </body>
          </html>
        `;

      case 'mini-chart':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>body{margin:0;padding:0;}</style>
          </head>
          <body>
            <div class="tradingview-widget-container">
              <div class="tradingview-widget-container__widget"></div>
              <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js" async>
              {
                "symbol": "${currentSymbol}",
                "width": "100%",
                "height": "${widgetHeight}",
                "locale": "en",
                "dateRange": "1D",
                "colorTheme": "${theme}",
                "isTransparent": false,
                "autosize": true,
                "largeChartUrl": ""
              }
              </script>
            </div>
          </body>
          </html>
        `;

      case 'market-overview':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>body{margin:0;padding:0;}</style>
          </head>
          <body>
            <div class="tradingview-widget-container">
              <div class="tradingview-widget-container__widget"></div>
              <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js" async>
              {
                "colorTheme": "${theme}",
                "dateRange": "1D",
                "showChart": true,
                "locale": "en",
                "width": "100%",
                "height": "${widgetHeight}",
                "largeChartUrl": "",
                "isTransparent": false,
                "showSymbolLogo": true,
                "showFloatingTooltip": false,
                "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
                "plotLineColorFalling": "rgba(255, 77, 92, 1)",
                "gridLineColor": "rgba(42, 46, 57, 0)",
                "scaleFontColor": "rgba(134, 137, 147, 1)",
                "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
                "belowLineFillColorFalling": "rgba(255, 77, 92, 0.12)",
                "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
                "belowLineFillColorFallingBottom": "rgba(255, 77, 92, 0)",
                "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
                "tabs": [
                  {
                    "title": "Crypto",
                    "symbols": [
                      {"s": "BINANCE:BTCUSDT", "d": "Bitcoin"},
                      {"s": "BINANCE:ETHUSDT", "d": "Ethereum"},
                      {"s": "BINANCE:SOLUSDT", "d": "Solana"}
                    ]
                  },
                  {
                    "title": "Forex",
                    "symbols": [
                      {"s": "FX:EURUSD", "d": "EUR/USD"},
                      {"s": "FX:GBPUSD", "d": "GBP/USD"},
                      {"s": "FX:USDJPY", "d": "USD/JPY"}
                    ]
                  }
                ]
              }
              </script>
            </div>
          </body>
          </html>
        `;

      case 'hotlists':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>body{margin:0;padding:0;}</style>
          </head>
          <body>
            <div class="tradingview-widget-container">
              <div class="tradingview-widget-container__widget"></div>
              <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js" async>
              {
                "colorTheme": "${theme}",
                "dateRange": "1D",
                "exchange": "CRYPTO",
                "showChart": true,
                "locale": "en",
                "width": "100%",
                "height": "${widgetHeight}",
                "largeChartUrl": "",
                "isTransparent": false,
                "showSymbolLogo": true,
                "showFloatingTooltip": false,
                "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
                "plotLineColorFalling": "rgba(255, 77, 92, 1)"
              }
              </script>
            </div>
          </body>
          </html>
        `;

      case 'economic-calendar':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>body{margin:0;padding:0;}</style>
          </head>
          <body>
            <div class="tradingview-widget-container">
              <div class="tradingview-widget-container__widget"></div>
              <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-events.js" async>
              {
                "colorTheme": "${theme}",
                "isTransparent": false,
                "width": "100%",
                "height": "${widgetHeight}",
                "locale": "en",
                "importanceFilter": "0,1",
                "currencyFilter": "USD,EUR,GBP,JPY"
              }
              </script>
            </div>
          </body>
          </html>
        `;

      case 'advanced-chart':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
            <style>html,body{margin:0;padding:0;height:100%;overflow:hidden;}</style>
          </head>
          <body>
            <div class="tradingview-widget-container" style="height:100%;width:100%">
              <div id="tradingview_chart" style="height:100%;width:100%"></div>
            </div>
            <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
            <script type="text/javascript">
              new TradingView.widget({
                "width": "100%",
                "height": "${widgetHeight}",
                "autosize": false,
                "symbol": "${currentSymbol}",
                "interval": "D",
                "timezone": "Etc/UTC",
                "theme": "${theme}",
                "style": "1",
                "locale": "en",
                "toolbar_bg": "#${bgColor}",
                "enable_publishing": false,
                "allow_symbol_change": true,
                "container_id": "tradingview_chart",
                "studies": ["STD;SMA"],
                "show_popup_button": true,
                "popup_width": "1000",
                "popup_height": "650"
              });
            </script>
          </body>
          </html>
        `;

      case 'ticker-tape':
        const tapeSymbols = symbols || ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'FX:EURUSD', 'OANDA:XAUUSD', 'SPX500', 'NAS100'];
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              html, body { margin:0; padding:0; height:100%; background: transparent; overflow:hidden; }
              .tradingview-widget-container { height:100% !important; background: transparent !important; }
              .tradingview-widget-container__widget { height:100% !important; background: transparent !important; }
            </style>
          </head>
          <body>
            <div class="tradingview-widget-container" style="height:100%;">
              <div class="tradingview-widget-container__widget" style="height:100%;"></div>
              <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js" async>
              {
                "symbols": ${JSON.stringify(tapeSymbols.map(s => ({ proName: s, title: s.split(':')[1] || s })))},
                "showSymbolLogo": true,
                "colorTheme": "${theme}",
                "isTransparent": true,
                "displayMode": "adaptive",
                "locale": "en"
              }
              </script>
            </div>
          </body>
          </html>
        `;

      case 'crypto-screener':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>body{margin:0;padding:0;}</style>
          </head>
          <body>
            <div class="tradingview-widget-container">
              <div class="tradingview-widget-container__widget"></div>
              <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-screener.js" async>
              {
                "width": "100%",
                "height": "${widgetHeight}",
                "defaultColumn": "overview",
                "defaultScreen": "general",
                "market": "crypto",
                "showToolbar": true,
                "colorTheme": "${theme}",
                "locale": "en"
              }
              </script>
            </div>
          </body>
          </html>
        `;

      case 'stock-heatmap':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>html,body{margin:0;padding:0;height:100%;overflow:hidden;}</style>
          </head>
          <body>
            <div class="tradingview-widget-container" style="height:100%;">
              <div class="tradingview-widget-container__widget" style="height:100%;"></div>
              <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js" async>
              {
                "exchanges": [],
                "dataSource": "SPX500",
                "blockSize": "market_cap_basic",
                "blockColor": "change",
                "grouping": "sector",
                "locale": "en",
                "colorTheme": "${theme}",
                "hasTopBar": false,
                "isDataSetEnabled": false,
                "isZoomEnabled": true,
                "hasSymbolTooltip": true,
                "width": "100%",
                "height": "${widgetHeight}"
              }
              </script>
            </div>
          </body>
          </html>
        `;

      case 'crypto-heatmap':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>html,body{margin:0;padding:0;height:100%;overflow:hidden;}</style>
          </head>
          <body>
            <div class="tradingview-widget-container" style="height:100%;">
              <div class="tradingview-widget-container__widget" style="height:100%;"></div>
              <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js" async>
              {
                "dataSource": "Crypto",
                "blockSize": "market_cap_calc",
                "blockColor": "change",
                "locale": "en",
                "colorTheme": "${theme}",
                "hasTopBar": false,
                "isDataSetEnabled": false,
                "isZoomEnabled": true,
                "hasSymbolTooltip": true,
                "width": "100%",
                "height": "${widgetHeight}"
              }
              </script>
            </div>
          </body>
          </html>
        `;

      case 'forex-heatmap':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>html,body{margin:0;padding:0;height:100%;overflow:hidden;}</style>
          </head>
          <body>
            <div class="tradingview-widget-container" style="height:100%;">
              <div class="tradingview-widget-container__widget" style="height:100%;"></div>
              <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-forex-heatmap.js" async>
              {
                "width": "100%",
                "height": "${widgetHeight}",
                "currencies": ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD"],
                "isTransparent": false,
                "colorTheme": "${theme}",
                "locale": "en"
              }
              </script>
            </div>
          </body>
          </html>
        `;

      case 'technical-analysis':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>body{margin:0;padding:0;}</style>
          </head>
          <body>
            <div class="tradingview-widget-container">
              <div class="tradingview-widget-container__widget"></div>
              <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js" async>
              {
                "interval": "1m",
                "width": "100%",
                "isTransparent": false,
                "height": "${widgetHeight}",
                "symbol": "${currentSymbol}",
                "showIntervalTabs": true,
                "locale": "en",
                "colorTheme": "${theme}"
              }
              </script>
            </div>
          </body>
          </html>
        `;

      case 'symbol-info':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>body{margin:0;padding:0;}</style>
          </head>
          <body>
            <div class="tradingview-widget-container">
              <div class="tradingview-widget-container__widget"></div>
              <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js" async>
              {
                "symbol": "${currentSymbol}",
                "width": "100%",
                "locale": "en",
                "colorTheme": "${theme}",
                "isTransparent": false
              }
              </script>
            </div>
          </body>
          </html>
        `;

      default:
        return `<html><body><p>Widget not found</p></body></html>`;
    }
  };

  return (
    <View>
      {allowPairChange && type !== 'ticker' && type !== 'ticker-tape' && type !== 'advanced-chart' && (
        <TouchableOpacity
          style={[styles.pairSelector, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => setShowPairPicker(true)}
        >
          <Text style={[styles.pairText, { color: colors.text }]}>
            {POPULAR_PAIRS.find(p => p.symbol === currentSymbol)?.name || currentSymbol}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      )}
      
      <View
        style={[
          styles.container,
          type === 'ticker-tape' ? styles.tickerContainer : {},
          { height: resolvedHeight, backgroundColor: type === 'ticker-tape' ? 'transparent' : colors.card },
        ]}
      >
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        <WebView
          source={{ html: getWidgetHtml() }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={true}
          scrollEnabled={false}
        />
      </View>

      <Modal
        visible={showPairPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPairPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Pair</Text>
              <TouchableOpacity onPress={() => setShowPairPicker(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={POPULAR_PAIRS}
              keyExtractor={(item) => item.symbol}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pairItem, { borderBottomColor: colors.border }]}
                  onPress={() => handlePairChange(item.symbol)}
                >
                  <Text style={[styles.pairItemText, { color: colors.text }]}>{item.name}</Text>
                  {currentSymbol === item.symbol && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  tickerContainer: {
    borderRadius: 0,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  pairSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  pairText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pairItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  pairItemText: {
    fontSize: 16,
  },
});
