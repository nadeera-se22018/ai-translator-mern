import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      <View style={styles.heroSection}>
        <Text style={styles.title}>AITranslaterLk</Text>
        <Text style={styles.subtitle}>Premium Translation Platform</Text>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.welcomeText}>Welcome to AITranslaterLk</Text>
        <Text style={styles.description}>
          Experience 60fps real-time translation powered by Gemini, Groq, and custom translation engines.
        </Text>
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={styles.translateButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Translation')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Sleek dark slate
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  heroSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#3b82f6', // Premium bright blue
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contentSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  actionSection: {
    marginBottom: 40,
  },
  translateButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
