import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet, StatusBar, Keyboard
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import RailwayServices from './RailwayServices';

const TEXT = {
  hi: {
    brand: 'RAIL TRACKER INDIA', tagline: 'आपकी रेल यात्रा, अब आसान',
    searchTitle: 'अपनी ट्रेन ट्रैक करें', trainHint: 'ट्रेन नंबर डालें (जैसे 12919)',
    search: 'लाइव स्टेटस देखें', settings: 'सेटिंग्स', apiTitle: 'लाइव डेटा कनेक्शन',
    apiHelp: 'अपनी RailCore API key डालें। यह केवल आपके फोन में सुरक्षित रखी जाएगी।',
    apiHint: 'RailCore API Key', save: 'Key सुरक्षित सेव करें', saved: 'API key सुरक्षित है',
    remove: 'Key हटाएँ', status: 'अभी की स्थिति', current: 'वर्तमान स्टेशन',
    delay: 'देरी', next: 'अगला स्टेशन', destination: 'गंतव्य पर अनुमानित आगमन',
    updated: 'डेटा अपडेट', route: 'ट्रेन का रूट', noRoute: 'रूट की जानकारी उपलब्ध नहीं है।',
    invalid: 'कृपया 4 से 6 अंकों का सही ट्रेन नंबर डालें।',
    needKey: 'पहले अपनी API key सेव करें।', badKey: 'API key गलत है या इसकी अनुमति नहीं है।',
    notFound: 'इस ट्रेन की जानकारी नहीं मिली।', offline: 'इंटरनेट कनेक्शन जाँचें और फिर कोशिश करें।',
    server: 'डेटा सर्वर अभी उपलब्ध नहीं है। थोड़ी देर बाद कोशिश करें।',
    loading: 'ट्रेन की लाइव जानकारी लाई जा रही है…', retry: 'दोबारा कोशिश करें',
    keySaved: 'आपकी API key सुरक्षित सेव हो गई।', keyRemoved: 'API key हटा दी गई।',
    cancel: 'रद्द करें', confirmRemove: 'क्या आप इस फोन से API key हटाना चाहते हैं?',
    provider: 'डेटा सेवा: RailCore (थर्ड-पार्टी)। यह Indian Railways / IRCTC का आधिकारिक ऐप नहीं है।',
    disclaimer: 'यात्रा से पहले महत्वपूर्ण जानकारी NTES पर भी जाँचें।',
    language: 'English', minutes: 'मिनट', unknown: 'उपलब्ध नहीं',
    train: 'ट्रेन', running: 'लाइव रनिंग स्टेटस', noData: 'अभी कोई ट्रेन खोजी नहीं गई है।'
  },
  en: {
    brand: 'RAIL TRACKER INDIA', tagline: 'Your journey, made simpler',
    searchTitle: 'Track your train', trainHint: 'Enter train number (e.g. 12919)',
    search: 'GET LIVE STATUS', settings: 'Settings', apiTitle: 'Live data connection',
    apiHelp: 'Enter your RailCore API key. It is stored securely on this device only.',
    apiHint: 'RailCore API Key', save: 'SAVE API KEY SECURELY', saved: 'API key is saved securely',
    remove: 'Remove key', status: 'Current status', current: 'Current station',
    delay: 'Delay', next: 'Next station', destination: 'Estimated destination arrival',
    updated: 'Data updated', route: 'Train route', noRoute: 'Route information is unavailable.',
    invalid: 'Enter a valid 4–6 digit train number.',
    needKey: 'Save your API key first.', badKey: 'API key is invalid or not authorized.',
    notFound: 'Train information was not found.', offline: 'Check your internet connection and try again.',
    server: 'The data service is unavailable. Please try again shortly.',
    loading: 'Fetching live train information…', retry: 'TRY AGAIN',
    keySaved: 'Your API key has been saved securely.', keyRemoved: 'API key removed.',
    cancel: 'Cancel', confirmRemove: 'Remove the API key from this device?',
    provider: 'Data provider: RailCore (third party). Not an official Indian Railways / IRCTC app.',
    disclaimer: 'Verify important travel information on NTES before departure.',
    language: 'हिन्दी', minutes: 'min', unknown: 'Not available',
    train: 'Train', running: 'LIVE RUNNING STATUS', noData: 'Search a train to see its live status.'
  }
};

const pick = (...values) => values.find(v => v !== undefined && v !== null && String(v).trim() !== '');
const formatTime = (value, fallback) => {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
};

export default function App() {
  const [lang, setLang] = useState('hi');
  const [trainNo, setTrainNo] = useState('');
  const [apiDraft, setApiDraft] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [train, setTrain] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const t = TEXT[lang];

  useEffect(() => {
    SecureStore.getItemAsync('railcore_api_key')
      .then(value => { if (value) { setApiKey(value); setHasKey(true); } })
      .catch(() => {});
  }, []);

  const saveKey = async () => {
    const value = apiDraft.trim();
    if (!value) { Alert.alert(t.apiTitle, t.needKey); return; }
    try {
      await SecureStore.setItemAsync('railcore_api_key', value);
      setApiKey(value); setHasKey(true); setApiDraft('');
      Alert.alert(t.apiTitle, t.keySaved);
    } catch (_) { Alert.alert(t.apiTitle, t.offline); }
  };

  const removeKey = () => {
    Alert.alert(t.apiTitle, t.confirmRemove, [
      { text: t.cancel, style: 'cancel' },
      { text: t.remove, style: 'destructive', onPress: async () => {
        try {
          await SecureStore.deleteItemAsync('railcore_api_key');
          setApiKey(''); setApiDraft(''); setHasKey(false); setTrain(null);
          Alert.alert(t.apiTitle, t.keyRemoved);
        } catch (_) { Alert.alert(t.apiTitle, t.offline); }
      }}
    ]);
  };

  const searchTrain = async () => {
    Keyboard.dismiss();
    const n = trainNo.trim();
    if (!/^\d{4,6}$/.test(n)) { Alert.alert(t.train, t.invalid); return; }
    if (!apiKey) { Alert.alert(t.apiTitle, t.needKey); return; }
    setBusy(true); setError(''); setTrain(null);
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 18000) : null;
    try {
      const response = await fetch('https://ir.railcore.tech/v1/trains/' + n + '/live', {
        method: 'GET',
        headers: { 'X-RailCore-Key': apiKey, Accept: 'application/json' },
        ...(controller ? { signal: controller.signal } : {})
      });
      let body = {};
      try { body = await response.json(); } catch (_) {}
      if (response.status === 401 || response.status === 403) { setError(t.badKey); return; }
      if (response.status === 404) { setError(t.notFound); return; }
      if (!response.ok) { setError(response.status >= 500 ? t.server : pick(body.message, body.error?.message, t.offline)); return; }
      const payload = body.data || body.result || body;
      if (!payload || (!payload.train_name && !payload.train_number && !payload.current_station && !payload.stations)) {
        setError(pick(body.message, body.error?.message, t.notFound)); return;
      }
      setTrain(payload);
    } catch (e) {
      setError(e?.name === 'AbortError' ? t.server : t.offline);
    } finally {
      if (timer) clearTimeout(timer);
      setBusy(false);
    }
  };

  const name = pick(train?.train_name, train?.name, train?.train_number, t.train);
  const current = pick(train?.current_station_name, train?.current_station?.station_name, train?.current_station, train?.current_station_code, t.unknown);
  const next = pick(train?.next_stop?.station_name, train?.next_station_name, train?.next_stop?.name, train?.next_stop, t.unknown);
  const delay = train?.delay_minutes;
  const stations = Array.isArray(train?.stations) ? train.stations : Array.isArray(train?.route) ? train.route : [];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#082f2b" />
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <View style={s.top}>
          <View style={s.logo}><Text style={s.logoIcon}>🚆</Text></View>
          <View style={s.brandBlock}>
            <Text style={s.brand}>{t.brand}</Text>
            <Text style={s.tagline}>{t.tagline}</Text>
          </View>
          <TouchableOpacity style={s.langButton} onPress={() => setLang(lang === 'hi' ? 'en' : 'hi')}>
            <Text style={s.langText}>{t.language}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.hero}>
          <Text style={s.eyebrow}>INDIA RAILWAYS • LIVE</Text>
          <Text style={s.heroTitle}>{t.searchTitle}</Text>
          <Text style={s.heroSub}>{t.tagline}</Text>
          <TextInput
            style={s.trainInput}
            value={trainNo}
            onChangeText={v => setTrainNo(v.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            placeholder={t.trainHint}
            placeholderTextColor="#82958e"
            returnKeyType="search"
            onSubmitEditing={searchTrain}
          />
          <TouchableOpacity style={[s.primary, busy && s.disabled]} onPress={searchTrain} disabled={busy} activeOpacity={0.85}>
            {busy ? <ActivityIndicator color="#082f2b" /> : <Text style={s.primaryText}>{t.search}  →</Text>}
          </TouchableOpacity>
        </View>

        {busy && <View style={s.loading}><ActivityIndicator color="#0e8067" /><Text style={s.loadingText}>{t.loading}</Text></View>}
        {!!error && <View style={s.errorBox}><Text style={s.errorTitle}>⚠  {t.server}</Text><Text style={s.errorText}>{error}</Text><TouchableOpacity onPress={searchTrain}><Text style={s.retry}>{t.retry} ↻</Text></TouchableOpacity></View>}

        {train && (
          <View style={s.resultWrap}>
            <View style={s.resultHead}>
              <View><Text style={s.resultLabel}>{t.running}</Text><Text style={s.trainName}>{String(name)}</Text><Text style={s.trainCode}>{pick(train.train_number, trainNo)}</Text></View>
              <View style={s.livePill}><View style={s.liveDot} /><Text style={s.liveText}>LIVE</Text></View>
            </View>
            <View style={s.stationBox}>
              <Text style={s.smallLabel}>{t.current.toUpperCase()}</Text>
              <Text style={s.stationName}>{String(current)}</Text>
              <Text style={s.statusText}>{String(pick(train.status_text, train.status, t.unknown))}</Text>
            </View>
            <View style={s.stats}>
              <View style={s.stat}><Text style={s.statLabel}>{t.delay}</Text><Text style={s.statValue}>{delay == null ? '—' : delay + ' ' + t.minutes}</Text></View>
              <View style={s.statDivider} />
              <View style={s.stat}><Text style={s.statLabel}>{t.next}</Text><Text style={s.statValue} numberOfLines={2}>{String(next)}</Text></View>
            </View>
            <View style={s.infoRow}><Text style={s.infoLabel}>{t.destination}</Text><Text style={s.infoValue}>{formatTime(train.eta_destination_at || train.destination_eta, t.unknown)}</Text></View>
            <View style={s.infoRow}><Text style={s.infoLabel}>{t.updated}</Text><Text style={s.infoValue}>{pick(train.freshness?.age_seconds != null ? train.freshness.age_seconds + 's ago' : null, t.unknown)}</Text></View>
            <View style={s.routeCard}>
              <Text style={s.routeTitle}>{t.route}</Text>
              {stations.length ? stations.slice(0, 20).map((station, i) => (
                <View style={s.routeItem} key={String(station.sequence || station.station_code || i)}>
                  <View style={s.routeRail}><View style={[s.routeDot, i === 0 && s.routeDotActive]} />{i < Math.min(stations.length, 20) - 1 && <View style={s.routeLine} />}</View>
                  <View style={s.routeText}><Text style={s.routeStation}>{pick(station.station_name, station.name, station.station_code, t.unknown)}</Text><Text style={s.routeTime}>{formatTime(station.eta || station.expected_arrival, '')}</Text></View>
                </View>
              )) : <Text style={s.emptyRoute}>{t.noRoute}</Text>}
            </View>
          </View>
        )}

        {!train && !busy && !error && <View style={s.empty}><Text style={s.emptyIcon}>🛤️</Text><Text style={s.emptyText}>{t.noData}</Text></View>}

        <RailwayServices lang={lang} />

        <View style={s.settingsCard}>
          <Text style={s.sectionEyebrow}>{t.settings.toUpperCase()}</Text>
          <Text style={s.settingsTitle}>{t.apiTitle}</Text>
          <Text style={s.settingsHelp}>{t.apiHelp}</Text>
          <TextInput style={s.keyInput} value={apiDraft} onChangeText={setApiDraft} placeholder={hasKey ? '••••••••••••••••' : t.apiHint} placeholderTextColor="#94a39d" secureTextEntry autoCapitalize="none" autoCorrect={false} />
          <TouchableOpacity style={s.saveButton} onPress={saveKey}><Text style={s.saveText}>{t.save}</Text></TouchableOpacity>
          {hasKey && <View style={s.keySavedRow}><Text style={s.keySavedText}>✓  {t.saved}</Text><TouchableOpacity onPress={removeKey}><Text style={s.removeText}>{t.remove}</Text></TouchableOpacity></View>}
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>{t.provider}</Text>
          <Text style={s.footerText}>{t.disclaimer} https://enquiry.indianrail.gov.in/ntes/</Text>
          <Text style={s.version}>RAIL TRACKER INDIA • VERSION 1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#f3f7f5'}, page:{padding:18,paddingBottom:34},
  top:{flexDirection:'row',alignItems:'center',marginBottom:20,marginTop:8},
  logo:{width:46,height:46,borderRadius:15,backgroundColor:'#0b4038',alignItems:'center',justifyContent:'center'},
  logoIcon:{fontSize:24},brandBlock:{flex:1,marginLeft:11},brand:{fontSize:13,fontWeight:'900',letterSpacing:1.1,color:'#103e35'},tagline:{fontSize:11,color:'#71847c',marginTop:3},
  langButton:{paddingVertical:9,paddingHorizontal:12,borderRadius:20,backgroundColor:'#e2eee8'},langText:{fontSize:11,fontWeight:'800',color:'#145b49'},
  hero:{backgroundColor:'#0b4038',borderRadius:24,padding:21,marginBottom:18,shadowColor:'#123c32',shadowOpacity:0.12,shadowRadius:14,elevation:5},
  eyebrow:{fontSize:9,color:'#9ad8bd',fontWeight:'900',letterSpacing:2},heroTitle:{fontSize:27,color:'#fff',fontWeight:'900',marginTop:10},heroSub:{fontSize:12,color:'#c1d9d0',marginTop:4,marginBottom:18},
  trainInput:{height:54,backgroundColor:'#fff',borderRadius:13,paddingHorizontal:15,fontSize:15,color:'#173d34',fontWeight:'600'},
  primary:{height:52,backgroundColor:'#b9efd2',borderRadius:13,alignItems:'center',justifyContent:'center',marginTop:12},disabled:{opacity:0.7},primaryText:{fontSize:13,fontWeight:'900',color:'#0b4038',letterSpacing:0.5},
  loading:{flexDirection:'row',alignItems:'center',justifyContent:'center',padding:18,gap:10},loadingText:{fontSize:12,color:'#557269'},
  errorBox:{backgroundColor:'#fff1ee',borderColor:'#f3d2ca',borderWidth:1,borderRadius:15,padding:15,marginBottom:16},errorTitle:{fontSize:13,fontWeight:'800',color:'#913c31'},errorText:{fontSize:12,color:'#774c45',marginTop:6},retry:{fontSize:12,fontWeight:'900',color:'#a34536',marginTop:12},
  resultWrap:{backgroundColor:'#fff',borderRadius:20,padding:16,marginBottom:18,borderWidth:1,borderColor:'#e5eee9'},
  resultHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:15},resultLabel:{fontSize:9,fontWeight:'900',letterSpacing:1.2,color:'#168168'},trainName:{fontSize:19,fontWeight:'900',color:'#163e34',marginTop:5},trainCode:{fontSize:11,color:'#7a8d84',marginTop:3},
  livePill:{flexDirection:'row',alignItems:'center',backgroundColor:'#e6f7ed',paddingHorizontal:10,paddingVertical:6,borderRadius:20},liveDot:{width:7,height:7,borderRadius:4,backgroundColor:'#16a36c',marginRight:5},liveText:{fontSize:9,fontWeight:'900',color:'#138257'},
  stationBox:{backgroundColor:'#edf7f1',borderRadius:15,padding:15},smallLabel:{fontSize:9,color:'#648176',fontWeight:'900',letterSpacing:1},stationName:{fontSize:20,fontWeight:'900',color:'#123f34',marginTop:6},statusText:{fontSize:11,color:'#52766a',marginTop:6},
  stats:{flexDirection:'row',paddingVertical:15,borderBottomWidth:1,borderColor:'#edf1ee'},stat:{flex:1},statDivider:{width:1,backgroundColor:'#e8eeea',marginHorizontal:13},statLabel:{fontSize:10,color:'#84948d'},statValue:{fontSize:14,fontWeight:'800',color:'#214b3e',marginTop:5},
  infoRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:11,borderBottomWidth:1,borderColor:'#f0f3f1'},infoLabel:{fontSize:11,color:'#82928b',flex:1},infoValue:{fontSize:11,color:'#31594c',fontWeight:'700',flex:1,textAlign:'right'},
  routeCard:{paddingTop:16},routeTitle:{fontSize:14,fontWeight:'900',color:'#183f35',marginBottom:12},routeItem:{flexDirection:'row',minHeight:47},routeRail:{width:20,alignItems:'center'},routeDot:{width:9,height:9,borderRadius:5,borderWidth:2,borderColor:'#7aab96',backgroundColor:'#fff',zIndex:1},routeDotActive:{backgroundColor:'#15936d',borderColor:'#15936d'},routeLine:{position:'absolute',top:8,bottom:-3,width:2,backgroundColor:'#d7e8df'},routeText:{flex:1,marginLeft:8,paddingBottom:11},routeStation:{fontSize:12,fontWeight:'700',color:'#34594c'},routeTime:{fontSize:10,color:'#8a9b93',marginTop:3},emptyRoute:{fontSize:11,color:'#84958d'},
  empty:{alignItems:'center',paddingVertical:23},emptyIcon:{fontSize:30},emptyText:{fontSize:12,color:'#84948d',marginTop:9,textAlign:'center'},
  settingsCard:{backgroundColor:'#fff',borderRadius:19,padding:17,borderWidth:1,borderColor:'#e5eee9',marginBottom:17},sectionEyebrow:{fontSize:9,color:'#168168',fontWeight:'900',letterSpacing:1.5},settingsTitle:{fontSize:17,fontWeight:'900',color:'#193f35',marginTop:6},settingsHelp:{fontSize:11,color:'#778981',lineHeight:17,marginTop:5},keyInput:{height:48,borderWidth:1,borderColor:'#dfe9e3',borderRadius:11,paddingHorizontal:13,marginTop:13,color:'#1b4438',fontSize:12},saveButton:{backgroundColor:'#0d5948',height:47,borderRadius:11,alignItems:'center',justifyContent:'center',marginTop:10},saveText:{fontSize:11,fontWeight:'900',color:'#fff',letterSpacing:0.5},keySavedRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:12},keySavedText:{fontSize:10,color:'#16845f',fontWeight:'700'},removeText:{fontSize:10,color:'#ad5146',fontWeight:'800'},
  footer:{paddingHorizontal:5},footerText:{fontSize:9,color:'#87968f',lineHeight:15,textAlign:'center',marginBottom:5},version:{fontSize:8,color:'#a5b0aa',fontWeight:'800',letterSpacing:1,textAlign:'center',marginTop:8}
});
