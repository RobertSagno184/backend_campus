import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CalculatorProps {
  display: string;
  onNumberPress: (number: string) => void;
  onOperatorPress: (operator: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onEquals: () => void;
  specialButton?: {
    text: string;
    color: string;
    onPress: () => void;
  };
}

const Calculator: React.FC<CalculatorProps> = ({
  display,
  onNumberPress,
  onOperatorPress,
  onClear,
  onDelete,
  onEquals,
  specialButton,
}) => {
  const Button: React.FC<{
    text: string;
    onPress: () => void;
    style?: any;
    textStyle?: any;
  }> = ({ text, onPress, style, textStyle }) => (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.buttonText, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Button text="7" onPress={() => onNumberPress("7")} />
        <Button text="8" onPress={() => onNumberPress("8")} />
        <Button text="9" onPress={() => onNumberPress("9")} />
        {specialButton ? (
          <Button
            text={specialButton.text}
            onPress={specialButton.onPress}
            style={[
              styles.operatorButton,
              { backgroundColor: specialButton.color },
            ]}
            textStyle={styles.operatorText}
          />
        ) : (
          <Button
            text="/"
            onPress={() => onOperatorPress("/")}
            style={styles.operatorButton}
            textStyle={styles.operatorText}
          />
        )}
      </View>

      <View style={styles.row}>
        <Button text="4" onPress={() => onNumberPress("4")} />
        <Button text="5" onPress={() => onNumberPress("5")} />
        <Button text="6" onPress={() => onNumberPress("6")} />
        <Button
          text="⌫"
          onPress={onDelete}
          style={styles.functionButton}
          textStyle={styles.functionText}
        />
      </View>

      <View style={styles.row}>
        <Button text="1" onPress={() => onNumberPress("1")} />
        <Button text="2" onPress={() => onNumberPress("2")} />
        <Button text="3" onPress={() => onNumberPress("3")} />
        <Button
          text="Ac"
          onPress={onClear}
          style={styles.functionButton}
          textStyle={styles.functionText}
        />
      </View>

      <View style={styles.row}>
        <Button
          text="0"
          onPress={() => onNumberPress("0")}
          style={styles.zeroButton}
        />
        <Button text="." onPress={() => onNumberPress(".")} />
        <Button
          text="="
          onPress={onEquals}
          style={styles.equalsButton}
          textStyle={styles.operatorText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#2D3748",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
  },
  operatorButton: {
    backgroundColor: "#4F46E5",
  },
  operatorText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  functionButton: {
    backgroundColor: "#718096",
  },
  functionText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  equalsButton: {
    backgroundColor: "#3182CE",
    width: 70,
  },
  zeroButton: {
    width: 150,
    borderRadius: 35,
  },
});

export default Calculator;
