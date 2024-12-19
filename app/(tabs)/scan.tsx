import * as ImagePicker from 'expo-image-picker';
import { getApps, initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import React from 'react';
import PagerView from 'react-native-pager-view';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/Button';

import {
  ActivityIndicator,
  Button,
  Image,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
  LogBox,
  Platform,
  TouchableOpacity,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: 'gs://hairmax-386c3.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
};

// Editing this file with fast refresh will reinitialize the app on every refresh, let's not do that
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

// Firebase sets some timers for a long period, which will trigger some warnings. Let's turn that off for this example
LogBox.ignoreLogs([`Setting a timer for a long period`]);

export default class App extends React.Component {
  state = {
    image: null,
    uploading: false,
    currentPage: 0, // Track the current page
  };

  async componentDidMount() {
    if (Platform.OS !== 'web') {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  }

  render() {
    let { image } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.actualHeaderText}>Full Hair Analysis</Text>
          <Ionicons
            size={34}
            name="settings-outline"
            color={'gray'}
            style={styles.icon}
          />
        </View>

        {!!image && (
          <Text style={styles.headerText}>
            Example: Upload ImagePicker result
          </Text>
        )}

        <PagerView
          style={styles.pagerView}
          initialPage={0}
          pageMargin={0}
          scrollEnabled={true}
          overdrag={true}
          onPageSelected={this._onPageSelected}
        >
          <View key="1" style={styles.scanContainer}>
            {/* <Button
              onPress={this._pickImage}
              title="Pick an image from camera roll"
            /> */}
            <TouchableOpacity
              onPress={this._takePhoto}
              style={styles.scanButton}
              // onPress={onSubmit}
              // disabled={isLoading}
            >
              {/* {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : null} */}
              <LinearGradient
                colors={[
                  'rgba(2,0,36,1)',
                  'rgba(9,9,121,1)',
                  'rgba(0,212,255,1)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.scanButton,
                  {
                    borderWidth: 1,
                    borderTopColor: '#4485ff',
                    borderLeftColor: '#4485ff',
                    borderRightColor: '#4485ff',
                    borderBottomColor: '#97cbf7',
                  },
                ]}
              >
                <Text style={styles.buttonText}>Begin Scan</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View key="2" style={styles.page}>
            <Text style={styles.pageText}>Lorem ipsum dolor sit amet...</Text>
          </View>
        </PagerView>

        {/* Render custom slider to indicate the selected tab */}
        <View style={styles.tabIndicatorContainer}>
          {[0, 1].map((index) => (
            <View
              key={index}
              style={{
                ...styles.tabIndicator,
                backgroundColor:
                  this.state.currentPage === index
                    ? 'white'
                    : 'rgba(255, 255, 255, 0.3)',
              }}
            />
          ))}
        </View>
        {this._maybeRenderImage()}
        {this._maybeRenderUploadingOverlay()}

        <StatusBar barStyle="default" />
      </View>
    );
  }

  _onPageSelected = (e: any) => {
    const newPage = e.nativeEvent.position;
    if (this.state.currentPage !== newPage) {
      this.setState({ currentPage: newPage });
    }
  };

  _maybeRenderUploadingOverlay = () => {
    if (this.state.uploading) {
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(0,0,0,0.4)',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <ActivityIndicator color="#fff" animating size="large" />
        </View>
      );
    }
  };

  _maybeRenderImage = () => {
    let { image } = this.state;
    if (!image) {
      return;
    }

    return (
      <View
        style={{
          marginTop: 30,
          width: 250,
          borderRadius: 3,
          elevation: 2,
        }}
      >
        <View
          style={{
            borderTopRightRadius: 3,
            borderTopLeftRadius: 3,
            shadowColor: 'rgba(0,0,0,1)',
            shadowOpacity: 0.2,
            shadowOffset: { width: 4, height: 4 },
            shadowRadius: 5,
            overflow: 'hidden',
          }}
        >
          <Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
        </View>
        <Text
          onPress={this._copyToClipboard}
          onLongPress={this._share}
          style={{ paddingVertical: 10, paddingHorizontal: 10 }}
        >
          {image}
        </Text>
      </View>
    );
  };

  _share = () => {
    if (this.state.image) {
      Share.share({
        message: this.state.image,
        title: 'Check out this photo',
        url: this.state.image,
      });
    } else {
      alert('No image to share');
    }
  };

  _copyToClipboard = () => {
    if (this.state.image) {
      Clipboard.setString(this.state.image);
      alert('Copied image URL to clipboard');
    } else {
      alert('No image to copy');
    }
  };

  _takePhoto = async () => {
    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    this._handleImagePicked(pickerResult);
  };

  _pickImage = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    console.log({ pickerResult });

    this._handleImagePicked(pickerResult);
  };

  _handleImagePicked = async (pickerResult: ImagePicker.ImagePickerResult) => {
    try {
      this.setState({ uploading: true });

      if (
        !pickerResult.canceled &&
        pickerResult.assets &&
        pickerResult.assets.length > 0
      ) {
        const uploadUrl = await uploadImageAsync(pickerResult.assets[0].uri);
        this.setState({ image: uploadUrl });
      }
    } catch (e) {
      console.log(e);
      alert('Upload failed, sorry :(');
    } finally {
      this.setState({ uploading: false });
    }
  };
}

async function uploadImageAsync(uri: string) {
  // Why are we using XMLHttpRequest? See:
  // https://github.com/expo/expo/issues/2402#issuecomment-443726662
  const blob = await new Promise<Blob>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  // Generate a unique filename using timestamp and random number
  const filename = `image_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 15)}.jpg`;
  const fileRef = ref(getStorage(), filename);
  const result = await uploadBytes(fileRef, blob);

  // We're done with the blob, return the download URL
  return await getDownloadURL(fileRef);
}

const styles = StyleSheet.create({
  header: {
    // flex: 1,
    flexDirection: 'row',
  },
  actualHeaderText: {
    fontSize: 30,
    // marginBottom: 20,
    top: 100,
    // backgroundColor: 'white',
    right: 40,
    textAlign: 'left',
    marginHorizontal: 15,
    color: 'white',
  },
  scanButton: {
    padding: 20,
    borderRadius: 30,
    top: 85,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  icon: {
    top: 100,
    left: 15,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#080815',
  },
  headerText: {
    fontSize: 20,
    // marginBottom: 20,
    textAlign: 'center',
    marginHorizontal: 15,
    color: 'white',
  },
  pagerView: {
    flex: 1,
    width: '100%',
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    borderColor: '#1b3263',
    borderWidth: 1,

    backgroundColor: '#161d2e',
    marginTop: 160,
    marginBottom: 180,
    marginRight: 40,
    marginLeft: 40,

    // Shadow properties for iOS
    shadowColor: '#1d3c80', // Color of the shadow
    shadowOffset: { width: 0, height: 0 }, // Position of the shadow
    shadowOpacity: 3, // Opacity of the shadow
    shadowRadius: 15, // Blur radius for the shadow

    // Shadow properties for Android
    elevation: 10, // Adds depth effect
  },
  pageText: {
    color: 'white',
  },
  tabIndicatorContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  tabIndicator: {
    width: 30,
    height: 8,
    bottom: 80,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeTabIndicator: {
    backgroundColor: 'white',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'semibold',
    fontSize: 18,
  },
});
