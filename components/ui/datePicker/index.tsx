import React, { useState } from 'react'
import { View, Text, Button, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

const App = () => {
  const [date, setDate] = useState(new Date())
  const [show, setShow] = useState(false)

  const onChange = (event: any, selectedDate: any) => {
    setShow(Platform.OS === 'ios')
    setDate(selectedDate || date)
  }

  const showDatepicker = () => {
    setShow(true)
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{date.toLocaleDateString()}</Text>
      <Button onPress={showDatepicker} title="Selecionar Data" />
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  )
}

export default App
