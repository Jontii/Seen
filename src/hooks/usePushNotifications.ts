import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotifications(): Promise<string | null> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: '5e00c4e8-35bd-4f33-a23f-57e2d75841e8',
  });

  return token.data;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const router = useRouter();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    if (!user) return;

    // Register and store token
    registerForPushNotifications().then(async (token) => {
      if (!token) return;

      await supabase.from('push_tokens').upsert(
        { user_id: user.id, expo_push_token: token },
        { onConflict: 'user_id,expo_push_token' },
      );
    });

    // Handle notification tap
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.tmdbId && data?.mediaType) {
        router.push(`/details/${data.tmdbId}?mediaType=${data.mediaType}`);
      }
    });

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);
}
