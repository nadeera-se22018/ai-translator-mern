import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Clipboard, 
  Modal, 
  FlatList, 
  StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { performTranslation } from '../services/api';

const LANGUAGES = [
  'English', 'Sinhala', 'Spanish', 'French', 'German', 'Italian', 
  'Portuguese', 'Russian', 'Japanese', 'Korean', 'Chinese (Simplified)', 
  'Arabic', 'Hindi'
];

export default function TranslationScreen({ navigation }) {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('English');
  const [targetLanguage, setTargetLanguage] = useState('Sinhala');
  const [mode, setMode] = useState('normal'); // normal, gemini, groq
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Dropdown states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingSource, setSelectingSource] = useState(true);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setFeedbackMessage('');
    try {
      const data = await performTranslation(inputText, sourceLanguage, targetLanguage, mode);
      if (data && data.translatedText) {
        setTranslatedText(data.translatedText);
      } else {
        setFeedbackMessage('Failed to translate');
      }
    } catch (error) {
      setFeedbackMessage(error.message || 'Network or API Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    
    // Swap contents too if present
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText('');
    }
  };

  const handleCopy = () => {
    if (translatedText) {
      Clipboard.setString(translatedText);
      setFeedbackMessage('Copied to clipboard!');
      setTimeout(() => setFeedbackMessage(''), 2000);
    }
  };

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
    setFeedbackMessage('');
  };

  const openLanguageSelect = (isSource) => {
    setSelectingSource(isSource);
    setModalVisible(true);
  };

  const selectLanguage = (lang) => {
    if (selectingSource) {
      setSourceLanguage(lang);
    } else {
      setTargetLanguage(lang);
    }
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header Area */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>&larr; Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Translate</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Language Selectors */}
        <View style={styles.languageBar}>
          <TouchableOpacity 
            style={styles.langButton}
            onPress={() => openLanguageSelect(true)}
          >
            <Text style={styles.langButtonLabel}>Source</Text>
            <Text style={styles.langButtonText}>{sourceLanguage}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.swapButton}
            onPress={handleSwap}
          >
            <Text style={styles.swapText}>&harr;</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.langButton}
            onPress={() => openLanguageSelect(false)}
          >
            <Text style={styles.langButtonLabel}>Target</Text>
            <Text style={styles.langButtonText}>{targetLanguage}</Text>
          </TouchableOpacity>
        </View>

        {/* Engine Mode Selectors */}
        <View style={styles.modeContainer}>
          {['normal', 'gemini', 'groq'].map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.modeButton,
                mode === m && styles.activeModeButton
              ]}
              onPress={() => setMode(m)}
            >
              <Text style={[
                styles.modeText,
                mode === m && styles.activeModeText
              ]}>
                {m === 'normal' ? 'Normal' : m === 'gemini' ? 'Gemini AI' : 'Groq AI'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Text Area Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Text Input</Text>
            {inputText.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Type your text to translate..."
            placeholderTextColor="#64748b"
            multiline
            value={inputText}
            onChangeText={setInputText}
          />
        </View>

        {/* Action button */}
        <TouchableOpacity 
          style={[styles.translateBtn, !inputText.trim() && styles.disabledTranslateBtn]}
          onPress={handleTranslate}
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.translateBtnText}>Translate Now</Text>
          )}
        </TouchableOpacity>

        {/* Feedback message (toast) */}
        {feedbackMessage ? (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        ) : null}

        {/* Translation Output Card */}
        <View style={[styles.card, styles.outputCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Translation</Text>
            {translatedText ? (
              <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
                <Text style={styles.copyText}>Copy Output</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          
          {isLoading ? (
            <View style={styles.skeletonContainer}>
              <View style={[styles.skeletonLine, { width: '85%' }]} />
              <View style={[styles.skeletonLine, { width: '60%' }]} />
              <View style={[styles.skeletonLine, { width: '75%' }]} />
            </View>
          ) : (
            <Text style={[styles.outputText, !translatedText && styles.placeholderOutput]}>
              {translatedText || 'Translation will appear here...'}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Language Selector Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {selectingSource ? 'Source' : 'Target'} Language
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.langSelectItem}
                  onPress={() => selectLanguage(item)}
                >
                  <Text style={styles.langSelectText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  backButtonText: {
    color: '#3b82f6',
    fontWeight: '700',
    fontSize: 14,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  languageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
  },
  langButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  langButtonLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  langButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
    marginTop: 2,
  },
  swapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  swapText: {
    color: '#3b82f6',
    fontSize: 22,
    fontWeight: 'bold',
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeModeButton: {
    backgroundColor: '#3b82f620',
    borderColor: '#3b82f6',
  },
  modeText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  activeModeText: {
    color: '#3b82f6',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#334155',
  },
  outputCard: {
    backgroundColor: '#0f172a',
    borderStyle: 'dashed',
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  clearButton: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#334155',
  },
  clearText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  copyButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#3b82f620',
  },
  copyText: {
    color: '#3b82f6',
    fontSize: 11,
    fontWeight: '700',
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  outputText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
  },
  placeholderOutput: {
    color: '#64748b',
    fontStyle: 'italic',
  },
  translateBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  disabledTranslateBtn: {
    backgroundColor: '#1e293b',
    opacity: 0.5,
  },
  translateBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  feedbackContainer: {
    backgroundColor: '#10b98120',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  feedbackText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '700',
  },
  skeletonContainer: {
    spaceY: 10,
    width: '100%',
    paddingTop: 8,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#334155',
    borderRadius: 6,
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    marginBottom: 8,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseText: {
    color: '#3b82f6',
    fontSize: 15,
    fontWeight: '700',
  },
  langSelectItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  langSelectText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
});
