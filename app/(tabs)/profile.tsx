
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabaseClient';
import { useUserStore } from '@/store/userStore';

export default function ProfileScreen() {
  const { signOut, userId } = useAuth();
  const { supabaseProfile, fetchSupabaseProfile, updateUserAvatar } = useUserStore();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchSupabaseProfile(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (supabaseProfile?.avatar_url) {
      setAvatarUrl(supabaseProfile.avatar_url);
    }
  }, [supabaseProfile]);

  const pickImage = async () => {
    console.log('pickImage function called');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = (uri: string) => {
    if (!userId) return;
    console.log('Uploading avatar from URI:', uri);

    const xhr = new XMLHttpRequest();
    xhr.onload = async () => {
      try {
        const blob = xhr.response;
        const fileExt = uri.split('.').pop();
        const fileName = `${userId}_${new Date().getTime()}.${fileExt}`;
        const filePath = `${fileName}`;

        console.log('Uploading to Supabase with filePath:', filePath);

        let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
        });

        if (uploadError) {
          throw uploadError;
        }

        console.log('Upload successful, getting public URL...');
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

        if (urlData) {
          console.log('Public URL obtained:', urlData.publicUrl);
          setAvatarUrl(urlData.publicUrl);
          await updateUserAvatar(userId, urlData.publicUrl);
          console.log('User avatar updated in database.');
        } else {
          throw new Error('Failed to get public URL for avatar.');
        }
      } catch (e: any) {
        console.error('Error during Supabase operation:', e);
        Alert.alert('Error', e.message || 'An unexpected error occurred.');
      }
    };
    xhr.onerror = (e) => {
      console.error('XMLHttpRequest error:', e);
      Alert.alert('Upload Error', 'Network request failed during upload.');
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {avatarUrl && <Image source={{ uri: avatarUrl }} style={styles.avatar} />}
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Change Profile Picture</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={() => signOut()}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: 'red',
    marginTop: 20,
  }
});
