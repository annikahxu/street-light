import React from 'react';
import { Button, View, Image, StyleSheet, ImageBackground } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withTiming,
    withRepeat
} from 'react-native-reanimated';
// import { opacity } from 'react-native-reanimated/lib/typescript/reanimated2/Colors';
import { Svg, Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function App() {

    const r = useSharedValue(0);

    React.useEffect(() => {
        r.value = withRepeat(withTiming(2000), -1, true);
    }, []);


    const animatedProps = useAnimatedProps(() => ({
        r: withTiming(r.value)
    }));

    return (
        <View style={styles.container}>
            {/* <ImageBackground source={require("../assets/streetLight.png")} style={styles.background}>
            </ImageBackground> */}
            <Svg style={styles.svg}>
                <AnimatedCircle
                    cx="50%"
                    cy="50%"
                    fill="#fffb9e"
                    animatedProps={animatedProps}
                />
            </Svg>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1d1e39',
    },
    background: {
        width: 250,
        height: 250,
    },
    svg: {
        // position: 'absolute',
        // flex: 1,
        // alignItems: 'center,',
        // justifyContent: 'center',
        height: 2000,
        width: 2000,
    },
    // image: {
    //     width: 250,
    //     height: 250,
    // }
});


// import React from 'react';
// import { StyleSheet, View, Text } from 'react-native';
// import Animated, {
//     useSharedValue,
//     useAnimatedStyle,
//     useAnimatedProps,
//     withTiming,
//     Easing,
//     withRepeat,
// } from 'react-native-reanimated';
// import { Svg, Circle } from 'react-native-svg';

// const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// export default function Animation() {
//     const dimension = useSharedValue(10);
//     console.log("animating")

//     const animatedProps = useAnimatedProps(() => ({
//         dimension: withTiming(dimension.value += 10),
//     }));
//     return (
//         <View style={styles.container}>
//             <Svg style={styles.svg}>
//                 <AnimatedCircle
//                     cx="50%"
//                     cy="50%"
//                     fill="#fff9be"
//                     animatedProps={animatedProps}
//                 />
//             </Svg>
//         </View>

//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         alignItems: 'center',
//     },
//     svg: {
//         height: 250,
//         width: '100%',
//     },
//     // svg: {
//     //     height: 10,
//     //     width: '100%',
//     //     color: '#fff9be',
//     // }
// })