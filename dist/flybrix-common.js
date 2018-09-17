(function() {
    'use strict';

    angular.module('flybrixCommon', []);
}());

(function () {
    'use strict';
    descriptorsHandler.$inject = [];
    angular.module('flybrixCommon').factory('descriptorsHandler', descriptorsHandler);
    function descriptorsHandler() {
        var versions = {"1.4.0":"1.4.txt","1.5.0":"1.5.txt","1.5.1":"1.5.txt","1.6.0":"1.6.txt","1.7.0":"1.7.txt"};
        var files = {"1.4.txt":"Vector3f={x:f32,y:f32,z:f32};PIDSettings={kp:f32,ki:f32,kd:f32,integral_windup_guard:f32,d_filter_time:f32,setpoint_filter_time:f32,command_to_value:f32};Version={major:u8,minor:u8,patch:u8};ConfigID=u32;PcbTransform={orientation:Vector3f,translation:Vector3f};MixTable={fz:[i8:8],tx:[i8:8],ty:[i8:8],tz:[i8:8]};MagBias={offset:Vector3f};ChannelProperties={assignment:{thrust:u8,pitch:u8,roll:u8,yaw:u8,aux1:u8,aux2:u8},inversion:{/8/thrust:void,pitch:void,roll:void,yaw:void,aux1:void,aux2:void},midpoint:[u16:6],deadzone:[u16:6]};PIDBypass={/8/thrust_master:void,pitch_master:void,roll_master:void,yaw_master:void,thrust_slave:void,pitch_slave:void,roll_slave:void,yaw_slave:void};PIDParameters={thrust_master:PIDSettings,pitch_master:PIDSettings,roll_master:PIDSettings,yaw_master:PIDSettings,thrust_slave:PIDSettings,pitch_slave:PIDSettings,roll_slave:PIDSettings,yaw_slave:PIDSettings,pid_bypass:PIDBypass};StateParameters={state_estimation:[f32:2],enable:[f32:2]};StatusFlag={/16/boot:void,mpu_fail:void,bmp_fail:void,rx_fail:void,idle:void,enabling:void,clear_mpu_bias:void,set_mpu_bias:void,fail_stability:void,fail_angle:void,enabled:void,battery_low:void,temp_warning:void,log_full:void,fail_other:void,override:void};Color={red:u8,green:u8,blue:u8};LEDStateColors={right_front:Color,right_back:Color,left_front:Color,left_back:Color};LEDStateCase={status:StatusFlag,pattern:u8,colors:LEDStateColors,indicator_red:bool,indicator_green:bool};LEDStates=[/16/LEDStateCase:16];LEDStatesFixed=[LEDStateCase:16];DeviceName=s9;Configuration={/16/version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStates,name:DeviceName};ConfigurationFixed={version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStatesFixed,name:DeviceName};ConfigurationFlag={/16/version:void,id:void,pcb_transform:void,mix_table:void,mag_bias:void,channel:void,pid_parameters:void,state_parameters:void,led_states:[//void:16],name:void};Rotation={pitch:f32,roll:f32,yaw:f32};PIDState={timestamp_us:u32,input:f32,setpoint:f32,p_term:f32,i_term:f32,d_term:f32};RcCommand={throttle:i16,pitch:i16,roll:i16,yaw:i16};State={/32/timestamp_us:u32,status:StatusFlag,v0_raw:u16,i0_raw:u16,i1_raw:u16,accel:Vector3f,gyro:Vector3f,mag:Vector3f,temperature:u16,pressure:u32,ppm:[i16:6],aux_chan_mask:u8,command:RcCommand,control:{fz:f32,tx:f32,ty:f32,tz:f32},pid_master_fz:PIDState,pid_master_tx:PIDState,pid_master_ty:PIDState,pid_master_tz:PIDState,pid_slave_fz:PIDState,pid_slave_tx:PIDState,pid_slave_ty:PIDState,pid_slave_tz:PIDState,motor_out:[i16:8],kinematics_angle:Rotation,kinematics_rate:Rotation,kinematics_altitude:f32,loop_count:u32};StateFields={/32/timestamp_us:void,status:void,v0_raw:void,i0_raw:void,i1_raw:void,accel:void,gyro:void,mag:void,temperature:void,pressure:void,ppm:void,aux_chan_mask:void,command:void,control:void,pid_master_fz:void,pid_master_tx:void,pid_master_ty:void,pid_master_tz:void,pid_slave_fz:void,pid_slave_tx:void,pid_slave_ty:void,pid_slave_tz:void,motor_out:void,kinematics_angle:void,kinematics_rate:void,kinematics_altitude:void,loop_count:void};AuxMask={//aux1_low:void,aux1_mid:void,aux1_high:void,aux2_low:void,aux2_mid:void,aux2_high:void};Command={/32/request_response:void,set_eeprom_data:ConfigurationFixed,reinit_eeprom_data:void,request_eeprom_data:void,request_enable_iteration:u8,motor_override_speed_0:u16,motor_override_speed_1:u16,motor_override_speed_2:u16,motor_override_speed_3:u16,motor_override_speed_4:u16,motor_override_speed_5:u16,motor_override_speed_6:u16,motor_override_speed_7:u16,set_command_override:bool,set_state_mask:StateFields,set_state_delay:u16,set_sd_write_delay:u16,set_led:{pattern:u8,color_right:Color,color_left:Color,indicator_red:bool,indicator_green:bool},set_serial_rc:{enabled:bool,command:RcCommand,aux_mask:AuxMask},set_card_recording_state:{/8/record_to_card:void,lock_recording_state:void},set_partial_eeprom_data:Configuration,reinit_partial_eeprom_data:ConfigurationFlag,req_partial_eeprom_data:ConfigurationFlag,req_card_recording_state:void,set_partial_temporary_config:Configuration,set_command_sources:{/8/serial:void,radio:void},set_calibration:{enabled:bool,mode:u8},set_autopilot_enabled:bool,set_usb_mode:u8};DebugString={deprecated_mask:u32,message:s};HistoryData=DebugString;Response={mask:u32,ack:u32};","1.5.txt":"Vector3f={x:f32,y:f32,z:f32};PIDSettings={kp:f32,ki:f32,kd:f32,integral_windup_guard:f32,d_filter_time:f32,setpoint_filter_time:f32,command_to_value:f32};Version={major:u8,minor:u8,patch:u8};ConfigID=u32;PcbTransform={orientation:Vector3f,translation:Vector3f};MixTable={fz:[i8:8],tx:[i8:8],ty:[i8:8],tz:[i8:8]};MagBias={offset:Vector3f};ChannelProperties={assignment:{thrust:u8,pitch:u8,roll:u8,yaw:u8,aux1:u8,aux2:u8},inversion:{/8/thrust:void,pitch:void,roll:void,yaw:void,aux1:void,aux2:void},midpoint:[u16:6],deadzone:[u16:6]};PIDBypass={/8/thrust_master:void,pitch_master:void,roll_master:void,yaw_master:void,thrust_slave:void,pitch_slave:void,roll_slave:void,yaw_slave:void};PIDParameters={thrust_master:PIDSettings,pitch_master:PIDSettings,roll_master:PIDSettings,yaw_master:PIDSettings,thrust_slave:PIDSettings,pitch_slave:PIDSettings,roll_slave:PIDSettings,yaw_slave:PIDSettings,thrust_gain:f32,pitch_gain:f32,roll_gain:f32,yaw_gain:f32,pid_bypass:PIDBypass};StateParameters={state_estimation:[f32:2],enable:[f32:2]};StatusFlag={/16/boot:void,mpu_fail:void,bmp_fail:void,rx_fail:void,idle:void,enabling:void,clear_mpu_bias:void,set_mpu_bias:void,fail_stability:void,fail_angle:void,enabled:void,battery_low:void,temp_warning:void,log_full:void,fail_other:void,override:void};Color={red:u8,green:u8,blue:u8};LEDStateColors={right_front:Color,right_back:Color,left_front:Color,left_back:Color};LEDStateCase={status:StatusFlag,pattern:u8,colors:LEDStateColors,indicator_red:bool,indicator_green:bool};LEDStates=[/16/LEDStateCase:16];LEDStatesFixed=[LEDStateCase:16];DeviceName=s9;Configuration={/16/version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStates,name:DeviceName};ConfigurationFixed={version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStatesFixed,name:DeviceName};ConfigurationFlag={/16/version:void,id:void,pcb_transform:void,mix_table:void,mag_bias:void,channel:void,pid_parameters:void,state_parameters:void,led_states:[//void:16],name:void,velocity_pid_parameters:void,inertial_bias:void};Rotation={pitch:f32,roll:f32,yaw:f32};PIDState={timestamp_us:u32,input:f32,setpoint:f32,p_term:f32,i_term:f32,d_term:f32};RcCommand={throttle:i16,pitch:i16,roll:i16,yaw:i16};State={/32/timestamp_us:u32,status:StatusFlag,v0_raw:u16,i0_raw:u16,i1_raw:u16,accel:Vector3f,gyro:Vector3f,mag:Vector3f,temperature:u16,pressure:u32,ppm:[i16:6],aux_chan_mask:u8,command:RcCommand,control:{fz:f32,tx:f32,ty:f32,tz:f32},pid_master_fz:PIDState,pid_master_tx:PIDState,pid_master_ty:PIDState,pid_master_tz:PIDState,pid_slave_fz:PIDState,pid_slave_tx:PIDState,pid_slave_ty:PIDState,pid_slave_tz:PIDState,motor_out:[i16:8],kinematics_angle:Rotation,kinematics_rate:Rotation,kinematics_altitude:f32,loop_count:u32};StateFields={/32/timestamp_us:void,status:void,v0_raw:void,i0_raw:void,i1_raw:void,accel:void,gyro:void,mag:void,temperature:void,pressure:void,ppm:void,aux_chan_mask:void,command:void,control:void,pid_master_fz:void,pid_master_tx:void,pid_master_ty:void,pid_master_tz:void,pid_slave_fz:void,pid_slave_tx:void,pid_slave_ty:void,pid_slave_tz:void,motor_out:void,kinematics_angle:void,kinematics_rate:void,kinematics_altitude:void,loop_count:void};AuxMask={//aux1_low:void,aux1_mid:void,aux1_high:void,aux2_low:void,aux2_mid:void,aux2_high:void};Command={/32/request_response:void,set_eeprom_data:ConfigurationFixed,reinit_eeprom_data:void,request_eeprom_data:void,request_enable_iteration:u8,motor_override_speed_0:u16,motor_override_speed_1:u16,motor_override_speed_2:u16,motor_override_speed_3:u16,motor_override_speed_4:u16,motor_override_speed_5:u16,motor_override_speed_6:u16,motor_override_speed_7:u16,set_command_override:bool,set_state_mask:StateFields,set_state_delay:u16,set_sd_write_delay:u16,set_led:{pattern:u8,color_right:Color,color_left:Color,indicator_red:bool,indicator_green:bool},set_serial_rc:{enabled:bool,command:RcCommand,aux_mask:AuxMask},set_card_recording_state:{/8/record_to_card:void,lock_recording_state:void},set_partial_eeprom_data:Configuration,reinit_partial_eeprom_data:ConfigurationFlag,req_partial_eeprom_data:ConfigurationFlag,req_card_recording_state:void,set_partial_temporary_config:Configuration,set_command_sources:{/8/serial:void,radio:void},set_calibration:{enabled:bool,mode:u8},set_autopilot_enabled:bool,set_usb_mode:u8};DebugString={deprecated_mask:u32,message:s};HistoryData=DebugString;Response={mask:u32,ack:u32};","1.6.txt":"Vector3f={x:f32,y:f32,z:f32};PIDSettings={kp:f32,ki:f32,kd:f32,integral_windup_guard:f32,d_filter_time:f32,setpoint_filter_time:f32,command_to_value:f32};Version={major:u8,minor:u8,patch:u8};ConfigID=u32;PcbTransform={orientation:Vector3f,translation:Vector3f};MixTable={fz:[i8:8],tx:[i8:8],ty:[i8:8],tz:[i8:8]};MagBias={offset:Vector3f};ChannelProperties={assignment:{thrust:u8,pitch:u8,roll:u8,yaw:u8,aux1:u8,aux2:u8},inversion:{/8/thrust:void,pitch:void,roll:void,yaw:void,aux1:void,aux2:void},midpoint:[u16:6],deadzone:[u16:6]};PIDBypass={/8/thrust_master:void,pitch_master:void,roll_master:void,yaw_master:void,thrust_slave:void,pitch_slave:void,roll_slave:void,yaw_slave:void};PIDParameters={thrust_master:PIDSettings,pitch_master:PIDSettings,roll_master:PIDSettings,yaw_master:PIDSettings,thrust_slave:PIDSettings,pitch_slave:PIDSettings,roll_slave:PIDSettings,yaw_slave:PIDSettings,thrust_gain:f32,pitch_gain:f32,roll_gain:f32,yaw_gain:f32,pid_bypass:PIDBypass};StateParameters={state_estimation:[f32:2],enable:[f32:2]};StatusFlag={/16/_0:void,_1:void,_2:void,no_signal:void,idle:void,arming:void,recording_sd:void,_7:void,loop_slow:void,_9:void,armed:void,battery_low:void,battery_critical:void,log_full:void,crash_detected:void,override:void};Color={red:u8,green:u8,blue:u8};LEDStateColors={right_front:Color,right_back:Color,left_front:Color,left_back:Color};LEDStateCase={status:StatusFlag,pattern:u8,colors:LEDStateColors,indicator_red:bool,indicator_green:bool};LEDStates=[/16/LEDStateCase:16];LEDStatesFixed=[LEDStateCase:16];DeviceName=s9;InertialBias={accel:Vector3f,gyro:Vector3f};VelocityPIDBypass={/8/forward_master:void,right_master:void,up_master:void,_unused_master:void,forward_slave:void,right_slave:void,up_slave:void,_unused_slave:void};VelocityPIDParameters={forward_master:PIDSettings,right_master:PIDSettings,up_master:PIDSettings,forward_slave:PIDSettings,right_slave:PIDSettings,up_slave:PIDSettings,pid_bypass:VelocityPIDBypass};Configuration={/16/version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStates,name:DeviceName,velocity_pid_parameters:VelocityPIDParameters,inertial_bias:InertialBias};ConfigurationFixed={version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStatesFixed,name:DeviceName,velocity_pid_parameters:VelocityPIDParameters,inertial_bias:InertialBias};ConfigurationFlag={/16/version:void,id:void,pcb_transform:void,mix_table:void,mag_bias:void,channel:void,pid_parameters:void,state_parameters:void,led_states:[//void:16],name:void,velocity_pid_parameters:void,inertial_bias:void};Rotation={pitch:f32,roll:f32,yaw:f32};PIDState={timestamp_us:u32,input:f32,setpoint:f32,p_term:f32,i_term:f32,d_term:f32};RcCommand={throttle:i16,pitch:i16,roll:i16,yaw:i16};State={/32/timestamp_us:u32,status:StatusFlag,v0_raw:u16,i0_raw:u16,i1_raw:u16,accel:Vector3f,gyro:Vector3f,mag:Vector3f,temperature:u16,pressure:u32,ppm:[i16:6],aux_chan_mask:u8,command:RcCommand,control:{fz:f32,tx:f32,ty:f32,tz:f32},pid_master_fz:PIDState,pid_master_tx:PIDState,pid_master_ty:PIDState,pid_master_tz:PIDState,pid_slave_fz:PIDState,pid_slave_tx:PIDState,pid_slave_ty:PIDState,pid_slave_tz:PIDState,motor_out:[i16:8],kinematics_angle:Rotation,kinematics_rate:Rotation,kinematics_altitude:f32,loop_count:u32};StateFields={/32/timestamp_us:void,status:void,v0_raw:void,i0_raw:void,i1_raw:void,accel:void,gyro:void,mag:void,temperature:void,pressure:void,ppm:void,aux_chan_mask:void,command:void,control:void,pid_master_fz:void,pid_master_tx:void,pid_master_ty:void,pid_master_tz:void,pid_slave_fz:void,pid_slave_tx:void,pid_slave_ty:void,pid_slave_tz:void,motor_out:void,kinematics_angle:void,kinematics_rate:void,kinematics_altitude:void,loop_count:void};AuxMask={//aux1_low:void,aux1_mid:void,aux1_high:void,aux2_low:void,aux2_mid:void,aux2_high:void};Command={/32/request_response:void,set_eeprom_data:ConfigurationFixed,reinit_eeprom_data:void,request_eeprom_data:void,request_enable_iteration:u8,motor_override_speed_0:u16,motor_override_speed_1:u16,motor_override_speed_2:u16,motor_override_speed_3:u16,motor_override_speed_4:u16,motor_override_speed_5:u16,motor_override_speed_6:u16,motor_override_speed_7:u16,set_command_override:bool,set_state_mask:StateFields,set_state_delay:u16,set_sd_write_delay:u16,set_led:{pattern:u8,color_right:Color,color_left:Color,indicator_red:bool,indicator_green:bool},set_serial_rc:{enabled:bool,command:RcCommand,aux_mask:AuxMask},set_card_recording_state:{/8/record_to_card:void,lock_recording_state:void},set_partial_eeprom_data:Configuration,reinit_partial_eeprom_data:ConfigurationFlag,req_partial_eeprom_data:ConfigurationFlag,req_card_recording_state:void,set_partial_temporary_config:Configuration,set_command_sources:{/8/serial:void,radio:void},set_calibration:{enabled:bool,mode:u8},set_autopilot_enabled:bool,set_usb_mode:u8};DebugString={deprecated_mask:u32,message:s};HistoryData=DebugString;Response={mask:u32,ack:u32};","1.7.txt":"Vector3f={x:f32,y:f32,z:f32};PIDSettings={kp:f32,ki:f32,kd:f32,integral_windup_guard:f32,d_filter_time:f32,setpoint_filter_time:f32,command_to_value:f32};Version={major:u8,minor:u8,patch:u8};ConfigID=u32;PcbTransform={orientation:Vector3f,translation:Vector3f};MixTable={fz:[i8:8],tx:[i8:8],ty:[i8:8],tz:[i8:8]};MagBias={offset:Vector3f};ChannelProperties={assignment:{thrust:u8,pitch:u8,roll:u8,yaw:u8,aux1:u8,aux2:u8},inversion:{/8/thrust:void,pitch:void,roll:void,yaw:void,aux1:void,aux2:void},midpoint:[u16:6],deadzone:[u16:6]};PIDBypass={/8/thrust_master:void,pitch_master:void,roll_master:void,yaw_master:void,thrust_slave:void,pitch_slave:void,roll_slave:void,yaw_slave:void};PIDParameters={thrust_master:PIDSettings,pitch_master:PIDSettings,roll_master:PIDSettings,yaw_master:PIDSettings,thrust_slave:PIDSettings,pitch_slave:PIDSettings,roll_slave:PIDSettings,yaw_slave:PIDSettings,thrust_gain:f32,pitch_gain:f32,roll_gain:f32,yaw_gain:f32,pid_bypass:PIDBypass};StateParameters={state_estimation:[f32:2],enable:[f32:2]};StatusFlag={/16/_0:void,_1:void,_2:void,no_signal:void,idle:void,arming:void,recording_sd:void,_7:void,loop_slow:void,_9:void,armed:void,battery_low:void,battery_critical:void,log_full:void,crash_detected:void,override:void};Color={red:u8,green:u8,blue:u8};LEDStateColors={right_front:Color,right_back:Color,left_front:Color,left_back:Color};LEDStateCase={status:StatusFlag,pattern:u8,colors:LEDStateColors,indicator_red:bool,indicator_green:bool};LEDStates=[/16/LEDStateCase:16];LEDStatesFixed=[LEDStateCase:16];DeviceName=s9;InertialBias={accel:Vector3f,gyro:Vector3f};VelocityPIDBypass={/8/forward_master:void,right_master:void,up_master:void,_unused_master:void,forward_slave:void,right_slave:void,up_slave:void,_unused_slave:void};VelocityPIDParameters={forward_master:PIDSettings,right_master:PIDSettings,up_master:PIDSettings,forward_slave:PIDSettings,right_slave:PIDSettings,up_slave:PIDSettings,pid_bypass:VelocityPIDBypass};Configuration={/16/version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStates,name:DeviceName,velocity_pid_parameters:VelocityPIDParameters,inertial_bias:InertialBias};ConfigurationFixed={version:Version,id:ConfigID,pcb_transform:PcbTransform,mix_table:MixTable,mag_bias:MagBias,channel:ChannelProperties,pid_parameters:PIDParameters,state_parameters:StateParameters,led_states:LEDStatesFixed,name:DeviceName,velocity_pid_parameters:VelocityPIDParameters,inertial_bias:InertialBias};ConfigurationFlag={/16/version:void,id:void,pcb_transform:void,mix_table:void,mag_bias:void,channel:void,pid_parameters:void,state_parameters:void,led_states:[//void:16],name:void,velocity_pid_parameters:void,inertial_bias:void};Rotation={pitch:f32,roll:f32,yaw:f32};PIDState={timestamp_us:u32,input:f32,setpoint:f32,p_term:f32,i_term:f32,d_term:f32};RcCommand={throttle:i16,pitch:i16,roll:i16,yaw:i16};State={/32/timestamp_us:u32,status:StatusFlag,v0_raw:u16,i0_raw:u16,i1_raw:u16,accel:Vector3f,gyro:Vector3f,mag:Vector3f,temperature:u16,pressure:u32,ppm:[i16:6],aux_chan_mask:u8,command:RcCommand,control:{fz:f32,tx:f32,ty:f32,tz:f32},pid_master_fz:PIDState,pid_master_tx:PIDState,pid_master_ty:PIDState,pid_master_tz:PIDState,pid_slave_fz:PIDState,pid_slave_tx:PIDState,pid_slave_ty:PIDState,pid_slave_tz:PIDState,motor_out:[i16:8],kinematics_angle:Rotation,kinematics_rate:Rotation,kinematics_altitude:f32,loop_count:u32};StateFields={/32/timestamp_us:void,status:void,v0_raw:void,i0_raw:void,i1_raw:void,accel:void,gyro:void,mag:void,temperature:void,pressure:void,ppm:void,aux_chan_mask:void,command:void,control:void,pid_master_fz:void,pid_master_tx:void,pid_master_ty:void,pid_master_tz:void,pid_slave_fz:void,pid_slave_tx:void,pid_slave_ty:void,pid_slave_tz:void,motor_out:void,kinematics_angle:void,kinematics_rate:void,kinematics_altitude:void,loop_count:void};AuxMask={//aux1_low:void,aux1_mid:void,aux1_high:void,aux2_low:void,aux2_mid:void,aux2_high:void};Command={/32/request_response:void,set_eeprom_data:ConfigurationFixed,reinit_eeprom_data:void,request_eeprom_data:void,request_enable_iteration:u8,motor_override_speed_0:u16,motor_override_speed_1:u16,motor_override_speed_2:u16,motor_override_speed_3:u16,motor_override_speed_4:u16,motor_override_speed_5:u16,motor_override_speed_6:u16,motor_override_speed_7:u16,set_command_override:bool,set_state_mask:StateFields,set_state_delay:u16,set_sd_write_delay:u16,set_led:{pattern:u8,color_right_front:Color,color_left_front:Color,color_right_back:Color,color_left_back:Color,indicator_red:bool,indicator_green:bool},set_serial_rc:{enabled:bool,command:RcCommand,aux_mask:AuxMask},set_card_recording_state:{/8/record_to_card:void,lock_recording_state:void},set_partial_eeprom_data:Configuration,reinit_partial_eeprom_data:ConfigurationFlag,req_partial_eeprom_data:ConfigurationFlag,req_card_recording_state:void,set_partial_temporary_config:Configuration,set_command_sources:{/8/serial:void,radio:void},set_calibration:{enabled:bool,mode:u8},set_autopilot_enabled:bool,set_usb_mode:u8};DebugString={deprecated_mask:u32,message:s};HistoryData=DebugString;Response={mask:u32,ack:u32};"};
        return { versions: versions, files: files };
    }
}());
(function() {
    'use strict';

    angular.module('flybrixCommon').factory('calibration', calibration);

    calibration.$inject = ['commandLog', 'serial'];

    function calibration(commandLog, serial) {
        return {
            magnetometer: magnetometer,
            accelerometer: {
                flat: calibrateAccelerometer.bind(null, 'flat', 0),
                forward: calibrateAccelerometer.bind(null, 'lean forward', 1),
                back: calibrateAccelerometer.bind(null, 'lean back', 2),
                right: calibrateAccelerometer.bind(null, 'lean right', 3),
                left: calibrateAccelerometer.bind(null, 'lean left', 4),
            },
            finish: finish,
        };

        function magnetometer() {
            commandLog("Calibrating magnetometer bias");
            return serial.sendStructure('Command', {
                request_response: true,
                set_calibration: {
                    enabled: true,
                    mode: 0,
                },
            }, false);
        }

        function calibrateAccelerometer(poseDescription, poseId) {
            commandLog("Calibrating gravity for pose: " + poseDescription);
            return serial.sendStructure('Command', {
                request_response: true,
                set_calibration: {
                    enabled: true,
                    mode: poseId + 1,
                },
            }, false);
        }

        function finish() {
            commandLog("Finishing calibration");
            return serial.sendStructure('Command', {
                request_response: true,
                set_calibration: {
                    enabled: false,
                    mode: 0,
                },
            }, false);
        }
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('cobs', cobs);

    function cobs() {
        return {
            Reader: Reader,
            encode: encode,
        };
    }


    function Reader(capacity) {
        if (capacity === undefined) {
            capacity = 2000;
        }
        this.N = capacity;
        this.buffer = new Uint8Array(capacity);
        this.ready_for_new_message = true;
        this.buffer_length = 0;
    }

    function cobsDecode(reader) {
        var src_ptr = 0;
        var dst_ptr = 0;
        var leftover_length = 0;
        var append_zero = false;
        while (reader.buffer[src_ptr]) {
            if (!leftover_length) {
                if (append_zero)
                    reader.buffer[dst_ptr++] = 0;
                leftover_length = reader.buffer[src_ptr++] - 1;
                append_zero = leftover_length < 0xFE;
            } else {
                --leftover_length;
                reader.buffer[dst_ptr++] = reader.buffer[src_ptr++];
            }
        }

        return leftover_length ? 0 : dst_ptr;
    }

    Reader.prototype.readBytes = function(data, onSuccess, onError) {
        for (var i = 0; i < data.length; i++) {
            var c = data[i];
            if (this.ready_for_new_message) {
                // first byte of a new message
                this.ready_for_new_message = false;
                this.buffer_length = 0;
            }

            this.buffer[this.buffer_length++] = c;

            if (c) {
                if (this.buffer_length === this.N) {
                    // buffer overflow, probably due to errors in data
                    onError('overflow', 'buffer overflow in COBS decoding');
                    this.ready_for_new_message = true;
                }
                continue;
            }

            this.buffer_length = cobsDecode(this);
            var failed_decode = (this.buffer_length === 0);
            if (failed_decode) {
                this.buffer[0] = 1;
            }
            var j;
            for (j = 1; j < this.buffer_length; ++j) {
                this.buffer[0] ^= this.buffer[j];
            }
            if (this.buffer[0] === 0) {  // check sum is correct
                this.ready_for_new_message = true;
                if (this.buffer_length > 0) {
                    onSuccess(this.buffer.slice(1, this.buffer_length));
                } else {
                    onError('short', 'Too short packet');
                }
            } else {  // bad checksum
                this.ready_for_new_message = true;
                var bytes = "";
                var message = "";
                for (j = 0; j < this.buffer_length; j++) {
                    bytes += this.buffer[j] + ",";
                    message += String.fromCharCode(this.buffer[j]);
                }
                if (failed_decode) {
                    onError('frame', 'Unexpected ending of packet');
                } else {
                    var msg = 'BAD CHECKSUM (' + this.buffer_length +
                        ' bytes)' + bytes + message;
                    onError('checksum', msg);
                }
            }
        }
    };

    function encode(buf) {
        var retval =
            new Uint8Array(Math.floor((buf.byteLength * 255 + 761) / 254));
        var len = 1;
        var pos_ctr = 0;
        for (var i = 0; i < buf.length; ++i) {
            if (retval[pos_ctr] == 0xFE) {
                retval[pos_ctr] = 0xFF;
                pos_ctr = len++;
                retval[pos_ctr] = 0;
            }
            var val = buf[i];
            ++retval[pos_ctr];
            if (val) {
                retval[len++] = val;
            } else {
                pos_ctr = len++;
                retval[pos_ctr] = 0;
            }
        }
        return retval.subarray(0, len).slice().buffer;
    };
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('commandLog', commandLog);

    commandLog.$inject = ['$q'];

    function commandLog($q) {
        var messages = [];
        var responder = $q.defer();

        var service = log;
        service.log = log;
        service.clearSubscribers = clearSubscribers;
        service.onMessage = onMessage;
        service.read = read;

        return service;

        function log(message) {
            if (message !== undefined) {
                messages.push(message);
                responder.notify(read());
            }
        }

        function read() {
            return messages;
        }

        function clearSubscribers() {
            responder = $q.defer();
        }

        function onMessage(callback) {
            return responder.promise.then(undefined, undefined, callback);
        }
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('deviceConfig', deviceConfig);

    deviceConfig.$inject = ['serial', 'commandLog', 'firmwareVersion', 'serializationHandler'];

    function deviceConfig(serial, commandLog, firmwareVersion, serializationHandler) {
        var config;

        var configCallback = function() {
            commandLog('No callback defined for receiving configurations!');
        };

        var loggingCallback = function() {
            commandLog(
                'No callback defined for receiving logging state!' +
                ' Callback arguments: (isLogging, isLocked, delay)');
        };

        serial.addOnReceiveCallback(function(messageType, message) {
            if (messageType !== 'Command') {
                return;
            }
            if ('set_eeprom_data' in message) {
                updateConfigFromRemoteData(message.set_eeprom_data);
            }
            if ('set_partial_eeprom_data' in message) {
                updateConfigFromRemoteData(message.set_partial_eeprom_data);
            }
            if (('set_card_recording_state' in message) && ('set_sd_write_delay' in message)) {
                var card_rec_state = message.set_card_recording_state;
                var sd_write_delay = message.set_sd_write_delay;
                loggingCallback(card_rec_state.record_to_card, card_rec_state.lock_recording_state, sd_write_delay);
            }
        });

        function getDesiredVersion() {
            return firmwareVersion.desired();
        }


        function request() {
            var handlers = firmwareVersion.serializationHandler();
            commandLog('Requesting current configuration data...');
            return serial.sendStructure('Command', {
                request_response: true,
                req_partial_eeprom_data: handlers.ConfigurationFlag.empty(),
            }, false);
        }

        function reinit() {
            commandLog('Setting factory default configuration data...');
            return serial.sendStructure('Command', {
                request_response: true,
                reinit_eeprom_data: true,
            }, false)
                .then(
                    function() {
                        return request();
                    },
                    function(reason) {
                        commandLog(
                            'Request for factory reset failed: ' + reason);
                    });
        }

        function send(newConfig) {
            return sendConfig({ config: newConfig, temporary: false, requestUpdate: true });
        }

        function sendConfig(properties) {
            var handlers = firmwareVersion.serializationHandler();
            var mask = properties.mask || handlers.ConfigurationFlag.empty();
            var newConfig = properties.config || config;
            var requestUpdate = properties.requestUpdate || false;
            var message = {
                request_response: true,
            };
            if (properties.temporary) {
                message.set_partial_temporary_config = newConfig;
                mask = { set_partial_temporary_config: mask };
            } else {
                message.set_partial_eeprom_data = newConfig;
                mask = { set_partial_eeprom_data: mask };
            }
            return serial.sendStructure('Command', message, true, mask).then(function() {
                if (requestUpdate) {
                    request();
                }
            });
        }

        function updateConfigFromRemoteData(configChanges) {
            //commandLog('Received config!');
            config = serializationHandler.updateFields(config, configChanges);
            var version = [config.version.major, config.version.minor, config.version.patch];
            firmwareVersion.set(version);
            if (!firmwareVersion.supported()) {
                commandLog('Received an unsupported configuration!');
                commandLog(
                    'Found version: ' + version[0] + '.' + version[1] + '.' + version[2]  +
                    ' --- Newest version: ' +
                    firmwareVersion.desiredKey() );
            } else {
                commandLog(
                    'Received configuration data (v' +
                    version[0] + '.' + version[1] + '.' + version[2] +')');
                configCallback();
            }
        }

        function setConfigCallback(callback) {
            configCallback = callback;
        }

        function setLoggingCallback(callback) {
            loggingCallback = callback;
        }

        function getConfig() {
            return config;
        }

        config = firmwareVersion.serializationHandler().Configuration.empty();

        return {
            request: request,
            reinit: reinit,
            send: send,
            sendConfig: sendConfig,
            getConfig: getConfig,
            setConfigCallback: setConfigCallback,
            setLoggingCallback: setLoggingCallback,
            getDesiredVersion: getDesiredVersion,
        };
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('firmwareVersion', firmwareVersion);

    firmwareVersion.$inject = ['serializationHandler'];

    function firmwareVersion(serializationHandler) {
        var version = [0, 0, 0];
        var key = '0.0.0';

        var newestVersion = serializationHandler.getNewestVersion();

        var desired = [newestVersion.major, newestVersion.minor, newestVersion.patch];
        var desiredKey = desired[0].toString() + '.' + desired[1].toString() + '.' + desired[2].toString();

        var defaultSerializationHandler = serializationHandler.getHandler(desiredKey);
        var currentSerializationHandler = defaultSerializationHandler;

        return {
            set: function(value) {
                version = value;
                key = value.join('.');
                currentSerializationHandler =
                    serializationHandler.getHandler(desiredKey) || defaultSerializationHandler;
            },
            get: function() {
                return version;
            },
            key: function() {
                return key;
            },
            supported: function() {
                return !!serializationHandler.getHandler(key);
            },
            desired: function() {
                return desired;
            },
            desiredKey: function() {
                return desiredKey;
            },
            serializationHandler: function() {
                return currentSerializationHandler;
            },
        };
    }

}());

(function () {
    'use strict';

    angular.module('flybrixCommon').factory('led', led);

    led.$inject = ['$q', 'serial'];

    function led($q, serial) {
        var LedPatterns = {
            NO_OVERRIDE: 0,
            FLASH: 1,
            BEACON: 2,
            BREATHE: 3,
            ALTERNATE: 4,
            SOLID: 5,
        };

        var urgent = false;
        var black = {red: 0, green: 0, blue: 0};

        function set(right_front, right_back, left_front, left_back, pattern, red, green) {
            if (!urgent && serial.busy()) {
                return $q.reject('Serial connection is too busy');
            }
            urgent = false;

            pattern = pattern || LedPatterns.NO_OVERRIDE;
            if (pattern < 0) {
                pattern = LedPatterns.NO_OVERRIDE;
            } else if (pattern > 5) {
                pattern = LedPatterns.SOLID;
            }

            var setter_command = {
                pattern: pattern,
                color_right: right_front || black,
                color_left: left_front || black,
                color_right_front: right_front || black,
                color_left_front: left_front || black,
                color_right_back: right_back || black,
                color_left_back: left_back || black,
                indicator_red: red,
                indicator_green: green,
            };

            return serial.sendStructure('Command', {
                request_response: true,
                set_led: setter_command,
            }, false);
        }

        function setSimple(red, green, blue) {
            var color = {red: red || 0, green: green || 0, blue: blue || 0};
            return set(color, color, color, color, LedPatterns.SOLID);
        }

        function clear() {
            return set();
        }

        function forceNextSend() {
            urgent = true;
        }

        return {
            set: set,
            setSimple: setSimple,
            clear: clear,
            patterns: LedPatterns,
            forceNextSend: forceNextSend,
        };
    }

}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('rcData', rcData);

    rcData.$inject = ['serial'];

    function rcData(serial) {
        var AUX = {
            LOW: 0,
            MID: 1,
            HIGH: 2,
        };
        var auxNames = ['low', 'mid', 'high'];

        var throttle = -1;
        var pitch = 0;
        var roll = 0;
        var yaw = 0;
        // defaults to high -- low is enabling; high is disabling
        var aux1 = AUX.HIGH;
        // defaults to ?? -- need to check transmitter behavior
        var aux2 = AUX.HIGH;

        var urgent = true;

        return {
            setThrottle: setThrottle,
            setPitch: setPitch,
            setRoll: setRoll,
            setYaw: setYaw,
            setAux1: setAux1,
            setAux2: setAux2,
            getThrottle: getThrottle,
            getPitch: getPitch,
            getRoll: getRoll,
            getYaw: getYaw,
            getAux1: getAux1,
            getAux2: getAux2,
            AUX: AUX,
            send: send,
            forceNextSend: forceNextSend,
        };

        function send() {
            if (!urgent && serial.busy()) {
                return;
            }
            urgent = false;

            var command = {};

            // invert pitch and roll
            var throttle_threshold =
                -0.8;  // keep bottom 10% of throttle stick to mean 'off'
            command.throttle = constrain(
                (throttle - throttle_threshold) * 4095 /
                    (1 - throttle_threshold),
                0, 4095);
            command.pitch =
                constrain(-(applyDeadzone(pitch, 0.1)) * 4095 / 2, -2047, 2047);
            command.roll =
                constrain((applyDeadzone(roll, 0.1)) * 4095 / 2, -2047, 2047);
            command.yaw =
                constrain(-(applyDeadzone(yaw, 0.1)) * 4095 / 2, -2047, 2047);

            var aux_mask = {};
            // aux1_low, aux1_mid, aux1_high, and same with aux2
            aux_mask['aux1_' + auxNames[aux1]] = true;
            aux_mask['aux2_' + auxNames[aux2]] = true;

            return serial.sendStructure('Command', {
                request_response: true,
                set_serial_rc: {
                    enabled: true,
                    command: command,
                    aux_mask: aux_mask,
                },
            }, false);
        }

        function setThrottle(v) {
            throttle = v;
        }

        function setPitch(v) {
            pitch = v;
        }

        function setRoll(v) {
            roll = v;
        }

        function setYaw(v) {
            yaw = v;
        }

        function setAux1(v) {
            aux1 = Math.max(0, Math.min(2, v));
        }

        function setAux2(v) {
            aux2 = Math.max(0, Math.min(2, v));
        }

        function getThrottle() {
            return throttle;
        }

        function getPitch() {
            return pitch;
        }

        function getRoll() {
            return roll;
        }

        function getYaw() {
            return yaw;
        }

        function getAux1() {
            return aux1;
        }

        function getAux2() {
            return aux2;
        }

        function forceNextSend() {
            urgent = true;
        }

        function constrain(x, xmin, xmax) {
            return Math.max(xmin, Math.min(x, xmax));
        }

        function applyDeadzone(value, deadzone) {
            if (value > deadzone) {
                return value - deadzone;
            }
            if (value < -deadzone) {
                return value + deadzone;
            }
            return 0;
        }
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('serial', serial);

    serial.$inject = ['$timeout', '$q', 'cobs', 'commandLog', 'firmwareVersion', 'serializationHandler'];

    function serial($timeout, $q, cobs, commandLog, firmwareVersion, serializationHandler) {
        var MessageType = {
            State: 0,
            Command: 1,
            DebugString: 3,
            HistoryData: 4,
            Protocol: 128,
            Response: 255,
        };

        var acknowledges = [];
        var backend = new Backend();

        var onReceiveListeners = [];

        var cobsReader = new cobs.Reader(10000);
        var bytesHandler = undefined;

        function Backend() {
        }

        Backend.prototype.busy = function() {
            return false;
        };

        Backend.prototype.send = function(data) {
            commandLog('No "send" defined for serial backend');
        };

        Backend.prototype.onRead = function(data) {
            commandLog('No "onRead" defined for serial backend');
        };

        var MessageTypeInversion = [];
        Object.keys(MessageType).forEach(function(key) {
            MessageTypeInversion[MessageType[key]] = key;
        });

        addOnReceiveCallback(function(messageType, message) {
            if (messageType === 'Response') {
                acknowledge(message.mask, message.ack);
            } else if (messageType === 'Protocol') {
                var data = message.response;
                if (data) {
                    serializationHandler.addHandler(data.version, data.structure);
                }
            }
        });

        return {
            busy: busy,
            sendStructure: sendStructure,
            setBackend: setBackend,
            addOnReceiveCallback: addOnReceiveCallback,
            removeOnReceiveCallback: removeOnReceiveCallback,
            setBytesHandler: setBytesHandler,
            handlePostConnect: handlePostConnect,
            Backend: Backend,
        };

        function setBackend(v) {
            backend = v;
            backend.onRead = read;
        }

        function handlePostConnect() {
            return requestFirmwareVersion();
        }

        function requestFirmwareVersion() {
            return sendStructure('Command', {
                request_response: true,
                req_partial_eeprom_data: {
                    version: true,
                },
            });
        }

        function sendStructure(messageType, data, log_send, extraMask) {
            if (messageType === 'State') {
                data = processStateOutput(data);
            }
            var handlers = firmwareVersion.serializationHandler();

            var response = $q.defer();
            if (!(messageType in MessageType)) {
                response.reject('Message type "' + messageType +
                    '" not supported by app, supported message types are:' +
                    Object.keys(MessageType).join(', '));
                return response.promise;
            }
            if (!(messageType in handlers)) {
                response.reject('Message type "' + messageType +
                    '" not supported by firmware, supported message types are:' +
                    Object.keys(handlers).join(', '));
                return response.promise;
            }
            var typeCode = MessageType[messageType];
            var handler = handlers[messageType];

            var buffer = new Uint8Array(handler.byteCount);

            var serializer = new serializationHandler.Serializer(new DataView(buffer.buffer));
            handler.encode(serializer, data, extraMask);
            var mask = handler.maskArray(data, extraMask);
            if (mask.length < 5) {
                mask = (mask[0] << 0) | (mask[1] << 8) | (mask[2] << 16) | (mask[3] << 24);
            }

            var dataLength = serializer.index;

            var output = new Uint8Array(dataLength + 3);
            output[0] = output[1] = typeCode;
            for (var idx = 0; idx < dataLength; ++idx) {
                output[0] ^= output[idx + 2] = buffer[idx];
            }
            output[dataLength + 2] = 0;

            acknowledges.push({
                mask: mask,
                response: response,
            });

            $timeout(function() {
                backend.send(new Uint8Array(cobs.encode(output)));
            }, 0);

            if (log_send) {
                commandLog('Sending command ' + typeCode);
            }

            return response.promise;
        }

        function busy() {
            return backend.busy();
        }

        function setBytesHandler(handler) {
            bytesHandler = handler;
        }

        function read(data) {
            if (bytesHandler)
                bytesHandler(data, processData);
            else
                cobsReader.readBytes(data, processData, reportIssues);
        }

        function reportIssues(issue, text) {
            commandLog('COBS decoding failed (' + issue + '): ' + text);
        }

        function addOnReceiveCallback(callback) {
            onReceiveListeners = onReceiveListeners.concat([callback]);
        }

        function removeOnReceiveCallback(callback) {
            onReceiveListeners = onReceiveListeners.filter(function(cb) {
                return cb !== callback;
            });
        }

        function acknowledge(mask, value) {
            while (acknowledges.length > 0) {
                var v = acknowledges.shift();
                if (v.mask ^ mask) {
                    v.response.reject('Missing ACK');
                    continue;
                }
                var relaxedMask = mask;
                relaxedMask &= ~1;
                if (relaxedMask ^ value) {
                    v.response.reject('Request was not fully processed');
                    break;
                }
                v.response.resolve();
                break;
            }
        }

        function processData(bytes) {
            var messageType = MessageTypeInversion[bytes[0]];
            var handler = firmwareVersion.serializationHandler()[messageType];
            if (!messageType || !handler) {
                commandLog('Illegal message type passed from firmware');
                return;
            }
            try {
                var serializer = new serializationHandler.Serializer(new DataView(bytes.buffer, 1));
                var message = handler.decode(serializer);
            } catch (err) {
                commandLog('Unrecognized message format received');
            }
            if (messageType === 'State') {
                message = processStateInput(message);
            }
            onReceiveListeners.forEach(function(listener) {
                listener(messageType, message);
            });
        }

        var last_timestamp_us = 0;

        function processStateInput(state) {
            state = Object.assign({}, state);
            var serial_update_rate_Hz = 0;

            if ('timestamp_us' in state) {
                state.serial_update_rate_estimate = 1000000 / (state.timestamp_us - last_timestamp_us);
                last_timestamp_us = state.timestamp_us;
            }
            if ('temperature' in state) {
                state.temperature /= 100.0;  // temperature given in Celsius * 100
            }
            if ('pressure' in state) {
                state.pressure /= 256.0;  // pressure given in (Q24.8) format
            }

            return state;
        }

        function processStateOutput(state) {
            state = Object.assign({}, state);
            if ('temperature' in state) {
                state.temperature *= 100.0;
            }
            if ('pressure' in state) {
                state.pressure *= 256.0;
            }
            return state;
        }
    }
}());

(function () {
    'use strict';

    serializationHandler.$inject = ['descriptorsHandler'];

    angular.module('flybrixCommon').factory('serializationHandler', serializationHandler);

    function serializationHandler(descriptorsHandler) {
        var handlerCache = {};

        var newestVersion = { major: 0, minor: 0, patch: 0 };

        function isNewerVersion(version) {
            if (version.major !== newestVersion.major) {
                return version.major > newestVersion.major;
            }
            if (version.minor !== newestVersion.minor) {
                return version.minor > newestVersion.minor;
            }
            return version.patch > newestVersion.patch;
        }

        function versionToString(version) {
            return version.major.toString() + '.' + version.minor.toString() + '.' + version.patch.toString();
        }

        function stringToVersion(version) {
            var parts = version.split('.');
            return {
                major: parseInt(parts[0]),
                minor: parseInt(parts[1]),
                patch: parseInt(parts[2]),
            };
        }

        function addHandler(version, structure) {
            if (isNewerVersion(version)) {
                newestVersion = {
                    major: version.major,
                    minor: version.minor,
                    patch: version.patch,
                };
            }
            handlerCache[versionToString(version)] = FlybrixSerialization.parse(structure);
        }

        function copyHandler(version, srcVersion) {
            if (isNewerVersion(version)) {
                newestVersion = {
                    major: version.major,
                    minor: version.minor,
                    patch: version.patch,
                };
            }
            handlerCache[versionToString(version)] = handlerCache[versionToString(srcVersion)];
        }

        var descVersions = descriptorsHandler.versions;
        var descFiles = descriptorsHandler.files;
        var descReverseMap = {};
        Object.keys(descVersions).forEach(function(key) {
            var vers = stringToVersion(key);
            var filename = descVersions[key];
            if (filename in descReverseMap) {
                copyHandler(vers, descReverseMap[filename])
            } else {
                filename = descVersions[key];
                addHandler(vers, descFiles[filename]);
                descReverseMap[filename] = vers;
            }
        });

        function updateFields(target, source) {
            if (source instanceof Array) {
                return updateFieldsArray(target, source);
            } else if (source instanceof Object) {
                return updateFieldsObject(target, source);
            } else {
                return (source === null || source === undefined) ? target : source;
            }
        }

        function updateFieldsObject(target, source) {
            var result = {};
            Object.keys(target).forEach(function (key) {
                result[key] = updateFields(target[key], source[key]);
            });
            Object.keys(source).forEach(function (key) {
                if (key in result) {
                    return;
                }
                result[key] = updateFields(target[key], source[key]);
            });
            return result;
        }

        function updateFieldsArray(target, source) {
            var length = Math.max(target.length, source.length);
            var result = [];
            for (var idx = 0; idx < length; ++idx) {
                result.push(updateFields(target[idx], source[idx]));
            }
            return result;
        }

        return {
            Serializer: FlybrixSerialization.Serializer,
            getHandler: function (firmware) {
                return handlerCache[firmware];
            },
            getNewestVersion: function () {
                return newestVersion;
            },
            addHandler: addHandler,
            copyHandler: copyHandler,
            updateFields: updateFields,
        };
    }

}());

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImRlc2NyaXB0b3JzLmpzIiwiY2FsaWJyYXRpb24uanMiLCJjb2JzLmpzIiwiY29tbWFuZExvZy5qcyIsImRldmljZUNvbmZpZy5qcyIsImZpcm13YXJlVmVyc2lvbi5qcyIsImxlZC5qcyIsInJjRGF0YS5qcyIsInNlcmlhbC5qcyIsInNlcmlhbGl6YXRpb25IYW5kbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDalBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImZseWJyaXgtY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJywgW10pO1xyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBkZXNjcmlwdG9yc0hhbmRsZXIuJGluamVjdCA9IFtdO1xuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnZGVzY3JpcHRvcnNIYW5kbGVyJywgZGVzY3JpcHRvcnNIYW5kbGVyKTtcbiAgICBmdW5jdGlvbiBkZXNjcmlwdG9yc0hhbmRsZXIoKSB7XG4gICAgICAgIHZhciB2ZXJzaW9ucyA9IHtcIjEuNC4wXCI6XCIxLjQudHh0XCIsXCIxLjUuMFwiOlwiMS41LnR4dFwiLFwiMS41LjFcIjpcIjEuNS50eHRcIixcIjEuNi4wXCI6XCIxLjYudHh0XCIsXCIxLjcuMFwiOlwiMS43LnR4dFwifTtcbiAgICAgICAgdmFyIGZpbGVzID0ge1wiMS40LnR4dFwiOlwiVmVjdG9yM2Y9e3g6ZjMyLHk6ZjMyLHo6ZjMyfTtQSURTZXR0aW5ncz17a3A6ZjMyLGtpOmYzMixrZDpmMzIsaW50ZWdyYWxfd2luZHVwX2d1YXJkOmYzMixkX2ZpbHRlcl90aW1lOmYzMixzZXRwb2ludF9maWx0ZXJfdGltZTpmMzIsY29tbWFuZF90b192YWx1ZTpmMzJ9O1ZlcnNpb249e21ham9yOnU4LG1pbm9yOnU4LHBhdGNoOnU4fTtDb25maWdJRD11MzI7UGNiVHJhbnNmb3JtPXtvcmllbnRhdGlvbjpWZWN0b3IzZix0cmFuc2xhdGlvbjpWZWN0b3IzZn07TWl4VGFibGU9e2Z6OltpODo4XSx0eDpbaTg6OF0sdHk6W2k4OjhdLHR6OltpODo4XX07TWFnQmlhcz17b2Zmc2V0OlZlY3RvcjNmfTtDaGFubmVsUHJvcGVydGllcz17YXNzaWdubWVudDp7dGhydXN0OnU4LHBpdGNoOnU4LHJvbGw6dTgseWF3OnU4LGF1eDE6dTgsYXV4Mjp1OH0saW52ZXJzaW9uOnsvOC90aHJ1c3Q6dm9pZCxwaXRjaDp2b2lkLHJvbGw6dm9pZCx5YXc6dm9pZCxhdXgxOnZvaWQsYXV4Mjp2b2lkfSxtaWRwb2ludDpbdTE2OjZdLGRlYWR6b25lOlt1MTY6Nl19O1BJREJ5cGFzcz17LzgvdGhydXN0X21hc3Rlcjp2b2lkLHBpdGNoX21hc3Rlcjp2b2lkLHJvbGxfbWFzdGVyOnZvaWQseWF3X21hc3Rlcjp2b2lkLHRocnVzdF9zbGF2ZTp2b2lkLHBpdGNoX3NsYXZlOnZvaWQscm9sbF9zbGF2ZTp2b2lkLHlhd19zbGF2ZTp2b2lkfTtQSURQYXJhbWV0ZXJzPXt0aHJ1c3RfbWFzdGVyOlBJRFNldHRpbmdzLHBpdGNoX21hc3RlcjpQSURTZXR0aW5ncyxyb2xsX21hc3RlcjpQSURTZXR0aW5ncyx5YXdfbWFzdGVyOlBJRFNldHRpbmdzLHRocnVzdF9zbGF2ZTpQSURTZXR0aW5ncyxwaXRjaF9zbGF2ZTpQSURTZXR0aW5ncyxyb2xsX3NsYXZlOlBJRFNldHRpbmdzLHlhd19zbGF2ZTpQSURTZXR0aW5ncyxwaWRfYnlwYXNzOlBJREJ5cGFzc307U3RhdGVQYXJhbWV0ZXJzPXtzdGF0ZV9lc3RpbWF0aW9uOltmMzI6Ml0sZW5hYmxlOltmMzI6Ml19O1N0YXR1c0ZsYWc9ey8xNi9ib290OnZvaWQsbXB1X2ZhaWw6dm9pZCxibXBfZmFpbDp2b2lkLHJ4X2ZhaWw6dm9pZCxpZGxlOnZvaWQsZW5hYmxpbmc6dm9pZCxjbGVhcl9tcHVfYmlhczp2b2lkLHNldF9tcHVfYmlhczp2b2lkLGZhaWxfc3RhYmlsaXR5OnZvaWQsZmFpbF9hbmdsZTp2b2lkLGVuYWJsZWQ6dm9pZCxiYXR0ZXJ5X2xvdzp2b2lkLHRlbXBfd2FybmluZzp2b2lkLGxvZ19mdWxsOnZvaWQsZmFpbF9vdGhlcjp2b2lkLG92ZXJyaWRlOnZvaWR9O0NvbG9yPXtyZWQ6dTgsZ3JlZW46dTgsYmx1ZTp1OH07TEVEU3RhdGVDb2xvcnM9e3JpZ2h0X2Zyb250OkNvbG9yLHJpZ2h0X2JhY2s6Q29sb3IsbGVmdF9mcm9udDpDb2xvcixsZWZ0X2JhY2s6Q29sb3J9O0xFRFN0YXRlQ2FzZT17c3RhdHVzOlN0YXR1c0ZsYWcscGF0dGVybjp1OCxjb2xvcnM6TEVEU3RhdGVDb2xvcnMsaW5kaWNhdG9yX3JlZDpib29sLGluZGljYXRvcl9ncmVlbjpib29sfTtMRURTdGF0ZXM9Wy8xNi9MRURTdGF0ZUNhc2U6MTZdO0xFRFN0YXRlc0ZpeGVkPVtMRURTdGF0ZUNhc2U6MTZdO0RldmljZU5hbWU9czk7Q29uZmlndXJhdGlvbj17LzE2L3ZlcnNpb246VmVyc2lvbixpZDpDb25maWdJRCxwY2JfdHJhbnNmb3JtOlBjYlRyYW5zZm9ybSxtaXhfdGFibGU6TWl4VGFibGUsbWFnX2JpYXM6TWFnQmlhcyxjaGFubmVsOkNoYW5uZWxQcm9wZXJ0aWVzLHBpZF9wYXJhbWV0ZXJzOlBJRFBhcmFtZXRlcnMsc3RhdGVfcGFyYW1ldGVyczpTdGF0ZVBhcmFtZXRlcnMsbGVkX3N0YXRlczpMRURTdGF0ZXMsbmFtZTpEZXZpY2VOYW1lfTtDb25maWd1cmF0aW9uRml4ZWQ9e3ZlcnNpb246VmVyc2lvbixpZDpDb25maWdJRCxwY2JfdHJhbnNmb3JtOlBjYlRyYW5zZm9ybSxtaXhfdGFibGU6TWl4VGFibGUsbWFnX2JpYXM6TWFnQmlhcyxjaGFubmVsOkNoYW5uZWxQcm9wZXJ0aWVzLHBpZF9wYXJhbWV0ZXJzOlBJRFBhcmFtZXRlcnMsc3RhdGVfcGFyYW1ldGVyczpTdGF0ZVBhcmFtZXRlcnMsbGVkX3N0YXRlczpMRURTdGF0ZXNGaXhlZCxuYW1lOkRldmljZU5hbWV9O0NvbmZpZ3VyYXRpb25GbGFnPXsvMTYvdmVyc2lvbjp2b2lkLGlkOnZvaWQscGNiX3RyYW5zZm9ybTp2b2lkLG1peF90YWJsZTp2b2lkLG1hZ19iaWFzOnZvaWQsY2hhbm5lbDp2b2lkLHBpZF9wYXJhbWV0ZXJzOnZvaWQsc3RhdGVfcGFyYW1ldGVyczp2b2lkLGxlZF9zdGF0ZXM6Wy8vdm9pZDoxNl0sbmFtZTp2b2lkfTtSb3RhdGlvbj17cGl0Y2g6ZjMyLHJvbGw6ZjMyLHlhdzpmMzJ9O1BJRFN0YXRlPXt0aW1lc3RhbXBfdXM6dTMyLGlucHV0OmYzMixzZXRwb2ludDpmMzIscF90ZXJtOmYzMixpX3Rlcm06ZjMyLGRfdGVybTpmMzJ9O1JjQ29tbWFuZD17dGhyb3R0bGU6aTE2LHBpdGNoOmkxNixyb2xsOmkxNix5YXc6aTE2fTtTdGF0ZT17LzMyL3RpbWVzdGFtcF91czp1MzIsc3RhdHVzOlN0YXR1c0ZsYWcsdjBfcmF3OnUxNixpMF9yYXc6dTE2LGkxX3Jhdzp1MTYsYWNjZWw6VmVjdG9yM2YsZ3lybzpWZWN0b3IzZixtYWc6VmVjdG9yM2YsdGVtcGVyYXR1cmU6dTE2LHByZXNzdXJlOnUzMixwcG06W2kxNjo2XSxhdXhfY2hhbl9tYXNrOnU4LGNvbW1hbmQ6UmNDb21tYW5kLGNvbnRyb2w6e2Z6OmYzMix0eDpmMzIsdHk6ZjMyLHR6OmYzMn0scGlkX21hc3Rlcl9mejpQSURTdGF0ZSxwaWRfbWFzdGVyX3R4OlBJRFN0YXRlLHBpZF9tYXN0ZXJfdHk6UElEU3RhdGUscGlkX21hc3Rlcl90ejpQSURTdGF0ZSxwaWRfc2xhdmVfZno6UElEU3RhdGUscGlkX3NsYXZlX3R4OlBJRFN0YXRlLHBpZF9zbGF2ZV90eTpQSURTdGF0ZSxwaWRfc2xhdmVfdHo6UElEU3RhdGUsbW90b3Jfb3V0OltpMTY6OF0sa2luZW1hdGljc19hbmdsZTpSb3RhdGlvbixraW5lbWF0aWNzX3JhdGU6Um90YXRpb24sa2luZW1hdGljc19hbHRpdHVkZTpmMzIsbG9vcF9jb3VudDp1MzJ9O1N0YXRlRmllbGRzPXsvMzIvdGltZXN0YW1wX3VzOnZvaWQsc3RhdHVzOnZvaWQsdjBfcmF3OnZvaWQsaTBfcmF3OnZvaWQsaTFfcmF3OnZvaWQsYWNjZWw6dm9pZCxneXJvOnZvaWQsbWFnOnZvaWQsdGVtcGVyYXR1cmU6dm9pZCxwcmVzc3VyZTp2b2lkLHBwbTp2b2lkLGF1eF9jaGFuX21hc2s6dm9pZCxjb21tYW5kOnZvaWQsY29udHJvbDp2b2lkLHBpZF9tYXN0ZXJfZno6dm9pZCxwaWRfbWFzdGVyX3R4OnZvaWQscGlkX21hc3Rlcl90eTp2b2lkLHBpZF9tYXN0ZXJfdHo6dm9pZCxwaWRfc2xhdmVfZno6dm9pZCxwaWRfc2xhdmVfdHg6dm9pZCxwaWRfc2xhdmVfdHk6dm9pZCxwaWRfc2xhdmVfdHo6dm9pZCxtb3Rvcl9vdXQ6dm9pZCxraW5lbWF0aWNzX2FuZ2xlOnZvaWQsa2luZW1hdGljc19yYXRlOnZvaWQsa2luZW1hdGljc19hbHRpdHVkZTp2b2lkLGxvb3BfY291bnQ6dm9pZH07QXV4TWFzaz17Ly9hdXgxX2xvdzp2b2lkLGF1eDFfbWlkOnZvaWQsYXV4MV9oaWdoOnZvaWQsYXV4Ml9sb3c6dm9pZCxhdXgyX21pZDp2b2lkLGF1eDJfaGlnaDp2b2lkfTtDb21tYW5kPXsvMzIvcmVxdWVzdF9yZXNwb25zZTp2b2lkLHNldF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uRml4ZWQscmVpbml0X2VlcHJvbV9kYXRhOnZvaWQscmVxdWVzdF9lZXByb21fZGF0YTp2b2lkLHJlcXVlc3RfZW5hYmxlX2l0ZXJhdGlvbjp1OCxtb3Rvcl9vdmVycmlkZV9zcGVlZF8wOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF8xOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF8yOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF8zOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF80OnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF81OnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF82OnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF83OnUxNixzZXRfY29tbWFuZF9vdmVycmlkZTpib29sLHNldF9zdGF0ZV9tYXNrOlN0YXRlRmllbGRzLHNldF9zdGF0ZV9kZWxheTp1MTYsc2V0X3NkX3dyaXRlX2RlbGF5OnUxNixzZXRfbGVkOntwYXR0ZXJuOnU4LGNvbG9yX3JpZ2h0OkNvbG9yLGNvbG9yX2xlZnQ6Q29sb3IsaW5kaWNhdG9yX3JlZDpib29sLGluZGljYXRvcl9ncmVlbjpib29sfSxzZXRfc2VyaWFsX3JjOntlbmFibGVkOmJvb2wsY29tbWFuZDpSY0NvbW1hbmQsYXV4X21hc2s6QXV4TWFza30sc2V0X2NhcmRfcmVjb3JkaW5nX3N0YXRlOnsvOC9yZWNvcmRfdG9fY2FyZDp2b2lkLGxvY2tfcmVjb3JkaW5nX3N0YXRlOnZvaWR9LHNldF9wYXJ0aWFsX2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb24scmVpbml0X3BhcnRpYWxfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbkZsYWcscmVxX3BhcnRpYWxfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbkZsYWcscmVxX2NhcmRfcmVjb3JkaW5nX3N0YXRlOnZvaWQsc2V0X3BhcnRpYWxfdGVtcG9yYXJ5X2NvbmZpZzpDb25maWd1cmF0aW9uLHNldF9jb21tYW5kX3NvdXJjZXM6ey84L3NlcmlhbDp2b2lkLHJhZGlvOnZvaWR9LHNldF9jYWxpYnJhdGlvbjp7ZW5hYmxlZDpib29sLG1vZGU6dTh9LHNldF9hdXRvcGlsb3RfZW5hYmxlZDpib29sLHNldF91c2JfbW9kZTp1OH07RGVidWdTdHJpbmc9e2RlcHJlY2F0ZWRfbWFzazp1MzIsbWVzc2FnZTpzfTtIaXN0b3J5RGF0YT1EZWJ1Z1N0cmluZztSZXNwb25zZT17bWFzazp1MzIsYWNrOnUzMn07XCIsXCIxLjUudHh0XCI6XCJWZWN0b3IzZj17eDpmMzIseTpmMzIsejpmMzJ9O1BJRFNldHRpbmdzPXtrcDpmMzIsa2k6ZjMyLGtkOmYzMixpbnRlZ3JhbF93aW5kdXBfZ3VhcmQ6ZjMyLGRfZmlsdGVyX3RpbWU6ZjMyLHNldHBvaW50X2ZpbHRlcl90aW1lOmYzMixjb21tYW5kX3RvX3ZhbHVlOmYzMn07VmVyc2lvbj17bWFqb3I6dTgsbWlub3I6dTgscGF0Y2g6dTh9O0NvbmZpZ0lEPXUzMjtQY2JUcmFuc2Zvcm09e29yaWVudGF0aW9uOlZlY3RvcjNmLHRyYW5zbGF0aW9uOlZlY3RvcjNmfTtNaXhUYWJsZT17Zno6W2k4OjhdLHR4OltpODo4XSx0eTpbaTg6OF0sdHo6W2k4OjhdfTtNYWdCaWFzPXtvZmZzZXQ6VmVjdG9yM2Z9O0NoYW5uZWxQcm9wZXJ0aWVzPXthc3NpZ25tZW50Ont0aHJ1c3Q6dTgscGl0Y2g6dTgscm9sbDp1OCx5YXc6dTgsYXV4MTp1OCxhdXgyOnU4fSxpbnZlcnNpb246ey84L3RocnVzdDp2b2lkLHBpdGNoOnZvaWQscm9sbDp2b2lkLHlhdzp2b2lkLGF1eDE6dm9pZCxhdXgyOnZvaWR9LG1pZHBvaW50Olt1MTY6Nl0sZGVhZHpvbmU6W3UxNjo2XX07UElEQnlwYXNzPXsvOC90aHJ1c3RfbWFzdGVyOnZvaWQscGl0Y2hfbWFzdGVyOnZvaWQscm9sbF9tYXN0ZXI6dm9pZCx5YXdfbWFzdGVyOnZvaWQsdGhydXN0X3NsYXZlOnZvaWQscGl0Y2hfc2xhdmU6dm9pZCxyb2xsX3NsYXZlOnZvaWQseWF3X3NsYXZlOnZvaWR9O1BJRFBhcmFtZXRlcnM9e3RocnVzdF9tYXN0ZXI6UElEU2V0dGluZ3MscGl0Y2hfbWFzdGVyOlBJRFNldHRpbmdzLHJvbGxfbWFzdGVyOlBJRFNldHRpbmdzLHlhd19tYXN0ZXI6UElEU2V0dGluZ3MsdGhydXN0X3NsYXZlOlBJRFNldHRpbmdzLHBpdGNoX3NsYXZlOlBJRFNldHRpbmdzLHJvbGxfc2xhdmU6UElEU2V0dGluZ3MseWF3X3NsYXZlOlBJRFNldHRpbmdzLHRocnVzdF9nYWluOmYzMixwaXRjaF9nYWluOmYzMixyb2xsX2dhaW46ZjMyLHlhd19nYWluOmYzMixwaWRfYnlwYXNzOlBJREJ5cGFzc307U3RhdGVQYXJhbWV0ZXJzPXtzdGF0ZV9lc3RpbWF0aW9uOltmMzI6Ml0sZW5hYmxlOltmMzI6Ml19O1N0YXR1c0ZsYWc9ey8xNi9ib290OnZvaWQsbXB1X2ZhaWw6dm9pZCxibXBfZmFpbDp2b2lkLHJ4X2ZhaWw6dm9pZCxpZGxlOnZvaWQsZW5hYmxpbmc6dm9pZCxjbGVhcl9tcHVfYmlhczp2b2lkLHNldF9tcHVfYmlhczp2b2lkLGZhaWxfc3RhYmlsaXR5OnZvaWQsZmFpbF9hbmdsZTp2b2lkLGVuYWJsZWQ6dm9pZCxiYXR0ZXJ5X2xvdzp2b2lkLHRlbXBfd2FybmluZzp2b2lkLGxvZ19mdWxsOnZvaWQsZmFpbF9vdGhlcjp2b2lkLG92ZXJyaWRlOnZvaWR9O0NvbG9yPXtyZWQ6dTgsZ3JlZW46dTgsYmx1ZTp1OH07TEVEU3RhdGVDb2xvcnM9e3JpZ2h0X2Zyb250OkNvbG9yLHJpZ2h0X2JhY2s6Q29sb3IsbGVmdF9mcm9udDpDb2xvcixsZWZ0X2JhY2s6Q29sb3J9O0xFRFN0YXRlQ2FzZT17c3RhdHVzOlN0YXR1c0ZsYWcscGF0dGVybjp1OCxjb2xvcnM6TEVEU3RhdGVDb2xvcnMsaW5kaWNhdG9yX3JlZDpib29sLGluZGljYXRvcl9ncmVlbjpib29sfTtMRURTdGF0ZXM9Wy8xNi9MRURTdGF0ZUNhc2U6MTZdO0xFRFN0YXRlc0ZpeGVkPVtMRURTdGF0ZUNhc2U6MTZdO0RldmljZU5hbWU9czk7Q29uZmlndXJhdGlvbj17LzE2L3ZlcnNpb246VmVyc2lvbixpZDpDb25maWdJRCxwY2JfdHJhbnNmb3JtOlBjYlRyYW5zZm9ybSxtaXhfdGFibGU6TWl4VGFibGUsbWFnX2JpYXM6TWFnQmlhcyxjaGFubmVsOkNoYW5uZWxQcm9wZXJ0aWVzLHBpZF9wYXJhbWV0ZXJzOlBJRFBhcmFtZXRlcnMsc3RhdGVfcGFyYW1ldGVyczpTdGF0ZVBhcmFtZXRlcnMsbGVkX3N0YXRlczpMRURTdGF0ZXMsbmFtZTpEZXZpY2VOYW1lfTtDb25maWd1cmF0aW9uRml4ZWQ9e3ZlcnNpb246VmVyc2lvbixpZDpDb25maWdJRCxwY2JfdHJhbnNmb3JtOlBjYlRyYW5zZm9ybSxtaXhfdGFibGU6TWl4VGFibGUsbWFnX2JpYXM6TWFnQmlhcyxjaGFubmVsOkNoYW5uZWxQcm9wZXJ0aWVzLHBpZF9wYXJhbWV0ZXJzOlBJRFBhcmFtZXRlcnMsc3RhdGVfcGFyYW1ldGVyczpTdGF0ZVBhcmFtZXRlcnMsbGVkX3N0YXRlczpMRURTdGF0ZXNGaXhlZCxuYW1lOkRldmljZU5hbWV9O0NvbmZpZ3VyYXRpb25GbGFnPXsvMTYvdmVyc2lvbjp2b2lkLGlkOnZvaWQscGNiX3RyYW5zZm9ybTp2b2lkLG1peF90YWJsZTp2b2lkLG1hZ19iaWFzOnZvaWQsY2hhbm5lbDp2b2lkLHBpZF9wYXJhbWV0ZXJzOnZvaWQsc3RhdGVfcGFyYW1ldGVyczp2b2lkLGxlZF9zdGF0ZXM6Wy8vdm9pZDoxNl0sbmFtZTp2b2lkLHZlbG9jaXR5X3BpZF9wYXJhbWV0ZXJzOnZvaWQsaW5lcnRpYWxfYmlhczp2b2lkfTtSb3RhdGlvbj17cGl0Y2g6ZjMyLHJvbGw6ZjMyLHlhdzpmMzJ9O1BJRFN0YXRlPXt0aW1lc3RhbXBfdXM6dTMyLGlucHV0OmYzMixzZXRwb2ludDpmMzIscF90ZXJtOmYzMixpX3Rlcm06ZjMyLGRfdGVybTpmMzJ9O1JjQ29tbWFuZD17dGhyb3R0bGU6aTE2LHBpdGNoOmkxNixyb2xsOmkxNix5YXc6aTE2fTtTdGF0ZT17LzMyL3RpbWVzdGFtcF91czp1MzIsc3RhdHVzOlN0YXR1c0ZsYWcsdjBfcmF3OnUxNixpMF9yYXc6dTE2LGkxX3Jhdzp1MTYsYWNjZWw6VmVjdG9yM2YsZ3lybzpWZWN0b3IzZixtYWc6VmVjdG9yM2YsdGVtcGVyYXR1cmU6dTE2LHByZXNzdXJlOnUzMixwcG06W2kxNjo2XSxhdXhfY2hhbl9tYXNrOnU4LGNvbW1hbmQ6UmNDb21tYW5kLGNvbnRyb2w6e2Z6OmYzMix0eDpmMzIsdHk6ZjMyLHR6OmYzMn0scGlkX21hc3Rlcl9mejpQSURTdGF0ZSxwaWRfbWFzdGVyX3R4OlBJRFN0YXRlLHBpZF9tYXN0ZXJfdHk6UElEU3RhdGUscGlkX21hc3Rlcl90ejpQSURTdGF0ZSxwaWRfc2xhdmVfZno6UElEU3RhdGUscGlkX3NsYXZlX3R4OlBJRFN0YXRlLHBpZF9zbGF2ZV90eTpQSURTdGF0ZSxwaWRfc2xhdmVfdHo6UElEU3RhdGUsbW90b3Jfb3V0OltpMTY6OF0sa2luZW1hdGljc19hbmdsZTpSb3RhdGlvbixraW5lbWF0aWNzX3JhdGU6Um90YXRpb24sa2luZW1hdGljc19hbHRpdHVkZTpmMzIsbG9vcF9jb3VudDp1MzJ9O1N0YXRlRmllbGRzPXsvMzIvdGltZXN0YW1wX3VzOnZvaWQsc3RhdHVzOnZvaWQsdjBfcmF3OnZvaWQsaTBfcmF3OnZvaWQsaTFfcmF3OnZvaWQsYWNjZWw6dm9pZCxneXJvOnZvaWQsbWFnOnZvaWQsdGVtcGVyYXR1cmU6dm9pZCxwcmVzc3VyZTp2b2lkLHBwbTp2b2lkLGF1eF9jaGFuX21hc2s6dm9pZCxjb21tYW5kOnZvaWQsY29udHJvbDp2b2lkLHBpZF9tYXN0ZXJfZno6dm9pZCxwaWRfbWFzdGVyX3R4OnZvaWQscGlkX21hc3Rlcl90eTp2b2lkLHBpZF9tYXN0ZXJfdHo6dm9pZCxwaWRfc2xhdmVfZno6dm9pZCxwaWRfc2xhdmVfdHg6dm9pZCxwaWRfc2xhdmVfdHk6dm9pZCxwaWRfc2xhdmVfdHo6dm9pZCxtb3Rvcl9vdXQ6dm9pZCxraW5lbWF0aWNzX2FuZ2xlOnZvaWQsa2luZW1hdGljc19yYXRlOnZvaWQsa2luZW1hdGljc19hbHRpdHVkZTp2b2lkLGxvb3BfY291bnQ6dm9pZH07QXV4TWFzaz17Ly9hdXgxX2xvdzp2b2lkLGF1eDFfbWlkOnZvaWQsYXV4MV9oaWdoOnZvaWQsYXV4Ml9sb3c6dm9pZCxhdXgyX21pZDp2b2lkLGF1eDJfaGlnaDp2b2lkfTtDb21tYW5kPXsvMzIvcmVxdWVzdF9yZXNwb25zZTp2b2lkLHNldF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uRml4ZWQscmVpbml0X2VlcHJvbV9kYXRhOnZvaWQscmVxdWVzdF9lZXByb21fZGF0YTp2b2lkLHJlcXVlc3RfZW5hYmxlX2l0ZXJhdGlvbjp1OCxtb3Rvcl9vdmVycmlkZV9zcGVlZF8wOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF8xOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF8yOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF8zOnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF80OnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF81OnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF82OnUxNixtb3Rvcl9vdmVycmlkZV9zcGVlZF83OnUxNixzZXRfY29tbWFuZF9vdmVycmlkZTpib29sLHNldF9zdGF0ZV9tYXNrOlN0YXRlRmllbGRzLHNldF9zdGF0ZV9kZWxheTp1MTYsc2V0X3NkX3dyaXRlX2RlbGF5OnUxNixzZXRfbGVkOntwYXR0ZXJuOnU4LGNvbG9yX3JpZ2h0OkNvbG9yLGNvbG9yX2xlZnQ6Q29sb3IsaW5kaWNhdG9yX3JlZDpib29sLGluZGljYXRvcl9ncmVlbjpib29sfSxzZXRfc2VyaWFsX3JjOntlbmFibGVkOmJvb2wsY29tbWFuZDpSY0NvbW1hbmQsYXV4X21hc2s6QXV4TWFza30sc2V0X2NhcmRfcmVjb3JkaW5nX3N0YXRlOnsvOC9yZWNvcmRfdG9fY2FyZDp2b2lkLGxvY2tfcmVjb3JkaW5nX3N0YXRlOnZvaWR9LHNldF9wYXJ0aWFsX2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb24scmVpbml0X3BhcnRpYWxfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbkZsYWcscmVxX3BhcnRpYWxfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbkZsYWcscmVxX2NhcmRfcmVjb3JkaW5nX3N0YXRlOnZvaWQsc2V0X3BhcnRpYWxfdGVtcG9yYXJ5X2NvbmZpZzpDb25maWd1cmF0aW9uLHNldF9jb21tYW5kX3NvdXJjZXM6ey84L3NlcmlhbDp2b2lkLHJhZGlvOnZvaWR9LHNldF9jYWxpYnJhdGlvbjp7ZW5hYmxlZDpib29sLG1vZGU6dTh9LHNldF9hdXRvcGlsb3RfZW5hYmxlZDpib29sLHNldF91c2JfbW9kZTp1OH07RGVidWdTdHJpbmc9e2RlcHJlY2F0ZWRfbWFzazp1MzIsbWVzc2FnZTpzfTtIaXN0b3J5RGF0YT1EZWJ1Z1N0cmluZztSZXNwb25zZT17bWFzazp1MzIsYWNrOnUzMn07XCIsXCIxLjYudHh0XCI6XCJWZWN0b3IzZj17eDpmMzIseTpmMzIsejpmMzJ9O1BJRFNldHRpbmdzPXtrcDpmMzIsa2k6ZjMyLGtkOmYzMixpbnRlZ3JhbF93aW5kdXBfZ3VhcmQ6ZjMyLGRfZmlsdGVyX3RpbWU6ZjMyLHNldHBvaW50X2ZpbHRlcl90aW1lOmYzMixjb21tYW5kX3RvX3ZhbHVlOmYzMn07VmVyc2lvbj17bWFqb3I6dTgsbWlub3I6dTgscGF0Y2g6dTh9O0NvbmZpZ0lEPXUzMjtQY2JUcmFuc2Zvcm09e29yaWVudGF0aW9uOlZlY3RvcjNmLHRyYW5zbGF0aW9uOlZlY3RvcjNmfTtNaXhUYWJsZT17Zno6W2k4OjhdLHR4OltpODo4XSx0eTpbaTg6OF0sdHo6W2k4OjhdfTtNYWdCaWFzPXtvZmZzZXQ6VmVjdG9yM2Z9O0NoYW5uZWxQcm9wZXJ0aWVzPXthc3NpZ25tZW50Ont0aHJ1c3Q6dTgscGl0Y2g6dTgscm9sbDp1OCx5YXc6dTgsYXV4MTp1OCxhdXgyOnU4fSxpbnZlcnNpb246ey84L3RocnVzdDp2b2lkLHBpdGNoOnZvaWQscm9sbDp2b2lkLHlhdzp2b2lkLGF1eDE6dm9pZCxhdXgyOnZvaWR9LG1pZHBvaW50Olt1MTY6Nl0sZGVhZHpvbmU6W3UxNjo2XX07UElEQnlwYXNzPXsvOC90aHJ1c3RfbWFzdGVyOnZvaWQscGl0Y2hfbWFzdGVyOnZvaWQscm9sbF9tYXN0ZXI6dm9pZCx5YXdfbWFzdGVyOnZvaWQsdGhydXN0X3NsYXZlOnZvaWQscGl0Y2hfc2xhdmU6dm9pZCxyb2xsX3NsYXZlOnZvaWQseWF3X3NsYXZlOnZvaWR9O1BJRFBhcmFtZXRlcnM9e3RocnVzdF9tYXN0ZXI6UElEU2V0dGluZ3MscGl0Y2hfbWFzdGVyOlBJRFNldHRpbmdzLHJvbGxfbWFzdGVyOlBJRFNldHRpbmdzLHlhd19tYXN0ZXI6UElEU2V0dGluZ3MsdGhydXN0X3NsYXZlOlBJRFNldHRpbmdzLHBpdGNoX3NsYXZlOlBJRFNldHRpbmdzLHJvbGxfc2xhdmU6UElEU2V0dGluZ3MseWF3X3NsYXZlOlBJRFNldHRpbmdzLHRocnVzdF9nYWluOmYzMixwaXRjaF9nYWluOmYzMixyb2xsX2dhaW46ZjMyLHlhd19nYWluOmYzMixwaWRfYnlwYXNzOlBJREJ5cGFzc307U3RhdGVQYXJhbWV0ZXJzPXtzdGF0ZV9lc3RpbWF0aW9uOltmMzI6Ml0sZW5hYmxlOltmMzI6Ml19O1N0YXR1c0ZsYWc9ey8xNi9fMDp2b2lkLF8xOnZvaWQsXzI6dm9pZCxub19zaWduYWw6dm9pZCxpZGxlOnZvaWQsYXJtaW5nOnZvaWQscmVjb3JkaW5nX3NkOnZvaWQsXzc6dm9pZCxsb29wX3Nsb3c6dm9pZCxfOTp2b2lkLGFybWVkOnZvaWQsYmF0dGVyeV9sb3c6dm9pZCxiYXR0ZXJ5X2NyaXRpY2FsOnZvaWQsbG9nX2Z1bGw6dm9pZCxjcmFzaF9kZXRlY3RlZDp2b2lkLG92ZXJyaWRlOnZvaWR9O0NvbG9yPXtyZWQ6dTgsZ3JlZW46dTgsYmx1ZTp1OH07TEVEU3RhdGVDb2xvcnM9e3JpZ2h0X2Zyb250OkNvbG9yLHJpZ2h0X2JhY2s6Q29sb3IsbGVmdF9mcm9udDpDb2xvcixsZWZ0X2JhY2s6Q29sb3J9O0xFRFN0YXRlQ2FzZT17c3RhdHVzOlN0YXR1c0ZsYWcscGF0dGVybjp1OCxjb2xvcnM6TEVEU3RhdGVDb2xvcnMsaW5kaWNhdG9yX3JlZDpib29sLGluZGljYXRvcl9ncmVlbjpib29sfTtMRURTdGF0ZXM9Wy8xNi9MRURTdGF0ZUNhc2U6MTZdO0xFRFN0YXRlc0ZpeGVkPVtMRURTdGF0ZUNhc2U6MTZdO0RldmljZU5hbWU9czk7SW5lcnRpYWxCaWFzPXthY2NlbDpWZWN0b3IzZixneXJvOlZlY3RvcjNmfTtWZWxvY2l0eVBJREJ5cGFzcz17LzgvZm9yd2FyZF9tYXN0ZXI6dm9pZCxyaWdodF9tYXN0ZXI6dm9pZCx1cF9tYXN0ZXI6dm9pZCxfdW51c2VkX21hc3Rlcjp2b2lkLGZvcndhcmRfc2xhdmU6dm9pZCxyaWdodF9zbGF2ZTp2b2lkLHVwX3NsYXZlOnZvaWQsX3VudXNlZF9zbGF2ZTp2b2lkfTtWZWxvY2l0eVBJRFBhcmFtZXRlcnM9e2ZvcndhcmRfbWFzdGVyOlBJRFNldHRpbmdzLHJpZ2h0X21hc3RlcjpQSURTZXR0aW5ncyx1cF9tYXN0ZXI6UElEU2V0dGluZ3MsZm9yd2FyZF9zbGF2ZTpQSURTZXR0aW5ncyxyaWdodF9zbGF2ZTpQSURTZXR0aW5ncyx1cF9zbGF2ZTpQSURTZXR0aW5ncyxwaWRfYnlwYXNzOlZlbG9jaXR5UElEQnlwYXNzfTtDb25maWd1cmF0aW9uPXsvMTYvdmVyc2lvbjpWZXJzaW9uLGlkOkNvbmZpZ0lELHBjYl90cmFuc2Zvcm06UGNiVHJhbnNmb3JtLG1peF90YWJsZTpNaXhUYWJsZSxtYWdfYmlhczpNYWdCaWFzLGNoYW5uZWw6Q2hhbm5lbFByb3BlcnRpZXMscGlkX3BhcmFtZXRlcnM6UElEUGFyYW1ldGVycyxzdGF0ZV9wYXJhbWV0ZXJzOlN0YXRlUGFyYW1ldGVycyxsZWRfc3RhdGVzOkxFRFN0YXRlcyxuYW1lOkRldmljZU5hbWUsdmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6VmVsb2NpdHlQSURQYXJhbWV0ZXJzLGluZXJ0aWFsX2JpYXM6SW5lcnRpYWxCaWFzfTtDb25maWd1cmF0aW9uRml4ZWQ9e3ZlcnNpb246VmVyc2lvbixpZDpDb25maWdJRCxwY2JfdHJhbnNmb3JtOlBjYlRyYW5zZm9ybSxtaXhfdGFibGU6TWl4VGFibGUsbWFnX2JpYXM6TWFnQmlhcyxjaGFubmVsOkNoYW5uZWxQcm9wZXJ0aWVzLHBpZF9wYXJhbWV0ZXJzOlBJRFBhcmFtZXRlcnMsc3RhdGVfcGFyYW1ldGVyczpTdGF0ZVBhcmFtZXRlcnMsbGVkX3N0YXRlczpMRURTdGF0ZXNGaXhlZCxuYW1lOkRldmljZU5hbWUsdmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6VmVsb2NpdHlQSURQYXJhbWV0ZXJzLGluZXJ0aWFsX2JpYXM6SW5lcnRpYWxCaWFzfTtDb25maWd1cmF0aW9uRmxhZz17LzE2L3ZlcnNpb246dm9pZCxpZDp2b2lkLHBjYl90cmFuc2Zvcm06dm9pZCxtaXhfdGFibGU6dm9pZCxtYWdfYmlhczp2b2lkLGNoYW5uZWw6dm9pZCxwaWRfcGFyYW1ldGVyczp2b2lkLHN0YXRlX3BhcmFtZXRlcnM6dm9pZCxsZWRfc3RhdGVzOlsvL3ZvaWQ6MTZdLG5hbWU6dm9pZCx2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczp2b2lkLGluZXJ0aWFsX2JpYXM6dm9pZH07Um90YXRpb249e3BpdGNoOmYzMixyb2xsOmYzMix5YXc6ZjMyfTtQSURTdGF0ZT17dGltZXN0YW1wX3VzOnUzMixpbnB1dDpmMzIsc2V0cG9pbnQ6ZjMyLHBfdGVybTpmMzIsaV90ZXJtOmYzMixkX3Rlcm06ZjMyfTtSY0NvbW1hbmQ9e3Rocm90dGxlOmkxNixwaXRjaDppMTYscm9sbDppMTYseWF3OmkxNn07U3RhdGU9ey8zMi90aW1lc3RhbXBfdXM6dTMyLHN0YXR1czpTdGF0dXNGbGFnLHYwX3Jhdzp1MTYsaTBfcmF3OnUxNixpMV9yYXc6dTE2LGFjY2VsOlZlY3RvcjNmLGd5cm86VmVjdG9yM2YsbWFnOlZlY3RvcjNmLHRlbXBlcmF0dXJlOnUxNixwcmVzc3VyZTp1MzIscHBtOltpMTY6Nl0sYXV4X2NoYW5fbWFzazp1OCxjb21tYW5kOlJjQ29tbWFuZCxjb250cm9sOntmejpmMzIsdHg6ZjMyLHR5OmYzMix0ejpmMzJ9LHBpZF9tYXN0ZXJfZno6UElEU3RhdGUscGlkX21hc3Rlcl90eDpQSURTdGF0ZSxwaWRfbWFzdGVyX3R5OlBJRFN0YXRlLHBpZF9tYXN0ZXJfdHo6UElEU3RhdGUscGlkX3NsYXZlX2Z6OlBJRFN0YXRlLHBpZF9zbGF2ZV90eDpQSURTdGF0ZSxwaWRfc2xhdmVfdHk6UElEU3RhdGUscGlkX3NsYXZlX3R6OlBJRFN0YXRlLG1vdG9yX291dDpbaTE2OjhdLGtpbmVtYXRpY3NfYW5nbGU6Um90YXRpb24sa2luZW1hdGljc19yYXRlOlJvdGF0aW9uLGtpbmVtYXRpY3NfYWx0aXR1ZGU6ZjMyLGxvb3BfY291bnQ6dTMyfTtTdGF0ZUZpZWxkcz17LzMyL3RpbWVzdGFtcF91czp2b2lkLHN0YXR1czp2b2lkLHYwX3Jhdzp2b2lkLGkwX3Jhdzp2b2lkLGkxX3Jhdzp2b2lkLGFjY2VsOnZvaWQsZ3lybzp2b2lkLG1hZzp2b2lkLHRlbXBlcmF0dXJlOnZvaWQscHJlc3N1cmU6dm9pZCxwcG06dm9pZCxhdXhfY2hhbl9tYXNrOnZvaWQsY29tbWFuZDp2b2lkLGNvbnRyb2w6dm9pZCxwaWRfbWFzdGVyX2Z6OnZvaWQscGlkX21hc3Rlcl90eDp2b2lkLHBpZF9tYXN0ZXJfdHk6dm9pZCxwaWRfbWFzdGVyX3R6OnZvaWQscGlkX3NsYXZlX2Z6OnZvaWQscGlkX3NsYXZlX3R4OnZvaWQscGlkX3NsYXZlX3R5OnZvaWQscGlkX3NsYXZlX3R6OnZvaWQsbW90b3Jfb3V0OnZvaWQsa2luZW1hdGljc19hbmdsZTp2b2lkLGtpbmVtYXRpY3NfcmF0ZTp2b2lkLGtpbmVtYXRpY3NfYWx0aXR1ZGU6dm9pZCxsb29wX2NvdW50OnZvaWR9O0F1eE1hc2s9ey8vYXV4MV9sb3c6dm9pZCxhdXgxX21pZDp2b2lkLGF1eDFfaGlnaDp2b2lkLGF1eDJfbG93OnZvaWQsYXV4Ml9taWQ6dm9pZCxhdXgyX2hpZ2g6dm9pZH07Q29tbWFuZD17LzMyL3JlcXVlc3RfcmVzcG9uc2U6dm9pZCxzZXRfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbkZpeGVkLHJlaW5pdF9lZXByb21fZGF0YTp2b2lkLHJlcXVlc3RfZWVwcm9tX2RhdGE6dm9pZCxyZXF1ZXN0X2VuYWJsZV9pdGVyYXRpb246dTgsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMDp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMTp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMjp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfMzp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNDp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNTp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNjp1MTYsbW90b3Jfb3ZlcnJpZGVfc3BlZWRfNzp1MTYsc2V0X2NvbW1hbmRfb3ZlcnJpZGU6Ym9vbCxzZXRfc3RhdGVfbWFzazpTdGF0ZUZpZWxkcyxzZXRfc3RhdGVfZGVsYXk6dTE2LHNldF9zZF93cml0ZV9kZWxheTp1MTYsc2V0X2xlZDp7cGF0dGVybjp1OCxjb2xvcl9yaWdodDpDb2xvcixjb2xvcl9sZWZ0OkNvbG9yLGluZGljYXRvcl9yZWQ6Ym9vbCxpbmRpY2F0b3JfZ3JlZW46Ym9vbH0sc2V0X3NlcmlhbF9yYzp7ZW5hYmxlZDpib29sLGNvbW1hbmQ6UmNDb21tYW5kLGF1eF9tYXNrOkF1eE1hc2t9LHNldF9jYXJkX3JlY29yZGluZ19zdGF0ZTp7LzgvcmVjb3JkX3RvX2NhcmQ6dm9pZCxsb2NrX3JlY29yZGluZ19zdGF0ZTp2b2lkfSxzZXRfcGFydGlhbF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uLHJlaW5pdF9wYXJ0aWFsX2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb25GbGFnLHJlcV9wYXJ0aWFsX2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb25GbGFnLHJlcV9jYXJkX3JlY29yZGluZ19zdGF0ZTp2b2lkLHNldF9wYXJ0aWFsX3RlbXBvcmFyeV9jb25maWc6Q29uZmlndXJhdGlvbixzZXRfY29tbWFuZF9zb3VyY2VzOnsvOC9zZXJpYWw6dm9pZCxyYWRpbzp2b2lkfSxzZXRfY2FsaWJyYXRpb246e2VuYWJsZWQ6Ym9vbCxtb2RlOnU4fSxzZXRfYXV0b3BpbG90X2VuYWJsZWQ6Ym9vbCxzZXRfdXNiX21vZGU6dTh9O0RlYnVnU3RyaW5nPXtkZXByZWNhdGVkX21hc2s6dTMyLG1lc3NhZ2U6c307SGlzdG9yeURhdGE9RGVidWdTdHJpbmc7UmVzcG9uc2U9e21hc2s6dTMyLGFjazp1MzJ9O1wiLFwiMS43LnR4dFwiOlwiVmVjdG9yM2Y9e3g6ZjMyLHk6ZjMyLHo6ZjMyfTtQSURTZXR0aW5ncz17a3A6ZjMyLGtpOmYzMixrZDpmMzIsaW50ZWdyYWxfd2luZHVwX2d1YXJkOmYzMixkX2ZpbHRlcl90aW1lOmYzMixzZXRwb2ludF9maWx0ZXJfdGltZTpmMzIsY29tbWFuZF90b192YWx1ZTpmMzJ9O1ZlcnNpb249e21ham9yOnU4LG1pbm9yOnU4LHBhdGNoOnU4fTtDb25maWdJRD11MzI7UGNiVHJhbnNmb3JtPXtvcmllbnRhdGlvbjpWZWN0b3IzZix0cmFuc2xhdGlvbjpWZWN0b3IzZn07TWl4VGFibGU9e2Z6OltpODo4XSx0eDpbaTg6OF0sdHk6W2k4OjhdLHR6OltpODo4XX07TWFnQmlhcz17b2Zmc2V0OlZlY3RvcjNmfTtDaGFubmVsUHJvcGVydGllcz17YXNzaWdubWVudDp7dGhydXN0OnU4LHBpdGNoOnU4LHJvbGw6dTgseWF3OnU4LGF1eDE6dTgsYXV4Mjp1OH0saW52ZXJzaW9uOnsvOC90aHJ1c3Q6dm9pZCxwaXRjaDp2b2lkLHJvbGw6dm9pZCx5YXc6dm9pZCxhdXgxOnZvaWQsYXV4Mjp2b2lkfSxtaWRwb2ludDpbdTE2OjZdLGRlYWR6b25lOlt1MTY6Nl19O1BJREJ5cGFzcz17LzgvdGhydXN0X21hc3Rlcjp2b2lkLHBpdGNoX21hc3Rlcjp2b2lkLHJvbGxfbWFzdGVyOnZvaWQseWF3X21hc3Rlcjp2b2lkLHRocnVzdF9zbGF2ZTp2b2lkLHBpdGNoX3NsYXZlOnZvaWQscm9sbF9zbGF2ZTp2b2lkLHlhd19zbGF2ZTp2b2lkfTtQSURQYXJhbWV0ZXJzPXt0aHJ1c3RfbWFzdGVyOlBJRFNldHRpbmdzLHBpdGNoX21hc3RlcjpQSURTZXR0aW5ncyxyb2xsX21hc3RlcjpQSURTZXR0aW5ncyx5YXdfbWFzdGVyOlBJRFNldHRpbmdzLHRocnVzdF9zbGF2ZTpQSURTZXR0aW5ncyxwaXRjaF9zbGF2ZTpQSURTZXR0aW5ncyxyb2xsX3NsYXZlOlBJRFNldHRpbmdzLHlhd19zbGF2ZTpQSURTZXR0aW5ncyx0aHJ1c3RfZ2FpbjpmMzIscGl0Y2hfZ2FpbjpmMzIscm9sbF9nYWluOmYzMix5YXdfZ2FpbjpmMzIscGlkX2J5cGFzczpQSURCeXBhc3N9O1N0YXRlUGFyYW1ldGVycz17c3RhdGVfZXN0aW1hdGlvbjpbZjMyOjJdLGVuYWJsZTpbZjMyOjJdfTtTdGF0dXNGbGFnPXsvMTYvXzA6dm9pZCxfMTp2b2lkLF8yOnZvaWQsbm9fc2lnbmFsOnZvaWQsaWRsZTp2b2lkLGFybWluZzp2b2lkLHJlY29yZGluZ19zZDp2b2lkLF83OnZvaWQsbG9vcF9zbG93OnZvaWQsXzk6dm9pZCxhcm1lZDp2b2lkLGJhdHRlcnlfbG93OnZvaWQsYmF0dGVyeV9jcml0aWNhbDp2b2lkLGxvZ19mdWxsOnZvaWQsY3Jhc2hfZGV0ZWN0ZWQ6dm9pZCxvdmVycmlkZTp2b2lkfTtDb2xvcj17cmVkOnU4LGdyZWVuOnU4LGJsdWU6dTh9O0xFRFN0YXRlQ29sb3JzPXtyaWdodF9mcm9udDpDb2xvcixyaWdodF9iYWNrOkNvbG9yLGxlZnRfZnJvbnQ6Q29sb3IsbGVmdF9iYWNrOkNvbG9yfTtMRURTdGF0ZUNhc2U9e3N0YXR1czpTdGF0dXNGbGFnLHBhdHRlcm46dTgsY29sb3JzOkxFRFN0YXRlQ29sb3JzLGluZGljYXRvcl9yZWQ6Ym9vbCxpbmRpY2F0b3JfZ3JlZW46Ym9vbH07TEVEU3RhdGVzPVsvMTYvTEVEU3RhdGVDYXNlOjE2XTtMRURTdGF0ZXNGaXhlZD1bTEVEU3RhdGVDYXNlOjE2XTtEZXZpY2VOYW1lPXM5O0luZXJ0aWFsQmlhcz17YWNjZWw6VmVjdG9yM2YsZ3lybzpWZWN0b3IzZn07VmVsb2NpdHlQSURCeXBhc3M9ey84L2ZvcndhcmRfbWFzdGVyOnZvaWQscmlnaHRfbWFzdGVyOnZvaWQsdXBfbWFzdGVyOnZvaWQsX3VudXNlZF9tYXN0ZXI6dm9pZCxmb3J3YXJkX3NsYXZlOnZvaWQscmlnaHRfc2xhdmU6dm9pZCx1cF9zbGF2ZTp2b2lkLF91bnVzZWRfc2xhdmU6dm9pZH07VmVsb2NpdHlQSURQYXJhbWV0ZXJzPXtmb3J3YXJkX21hc3RlcjpQSURTZXR0aW5ncyxyaWdodF9tYXN0ZXI6UElEU2V0dGluZ3MsdXBfbWFzdGVyOlBJRFNldHRpbmdzLGZvcndhcmRfc2xhdmU6UElEU2V0dGluZ3MscmlnaHRfc2xhdmU6UElEU2V0dGluZ3MsdXBfc2xhdmU6UElEU2V0dGluZ3MscGlkX2J5cGFzczpWZWxvY2l0eVBJREJ5cGFzc307Q29uZmlndXJhdGlvbj17LzE2L3ZlcnNpb246VmVyc2lvbixpZDpDb25maWdJRCxwY2JfdHJhbnNmb3JtOlBjYlRyYW5zZm9ybSxtaXhfdGFibGU6TWl4VGFibGUsbWFnX2JpYXM6TWFnQmlhcyxjaGFubmVsOkNoYW5uZWxQcm9wZXJ0aWVzLHBpZF9wYXJhbWV0ZXJzOlBJRFBhcmFtZXRlcnMsc3RhdGVfcGFyYW1ldGVyczpTdGF0ZVBhcmFtZXRlcnMsbGVkX3N0YXRlczpMRURTdGF0ZXMsbmFtZTpEZXZpY2VOYW1lLHZlbG9jaXR5X3BpZF9wYXJhbWV0ZXJzOlZlbG9jaXR5UElEUGFyYW1ldGVycyxpbmVydGlhbF9iaWFzOkluZXJ0aWFsQmlhc307Q29uZmlndXJhdGlvbkZpeGVkPXt2ZXJzaW9uOlZlcnNpb24saWQ6Q29uZmlnSUQscGNiX3RyYW5zZm9ybTpQY2JUcmFuc2Zvcm0sbWl4X3RhYmxlOk1peFRhYmxlLG1hZ19iaWFzOk1hZ0JpYXMsY2hhbm5lbDpDaGFubmVsUHJvcGVydGllcyxwaWRfcGFyYW1ldGVyczpQSURQYXJhbWV0ZXJzLHN0YXRlX3BhcmFtZXRlcnM6U3RhdGVQYXJhbWV0ZXJzLGxlZF9zdGF0ZXM6TEVEU3RhdGVzRml4ZWQsbmFtZTpEZXZpY2VOYW1lLHZlbG9jaXR5X3BpZF9wYXJhbWV0ZXJzOlZlbG9jaXR5UElEUGFyYW1ldGVycyxpbmVydGlhbF9iaWFzOkluZXJ0aWFsQmlhc307Q29uZmlndXJhdGlvbkZsYWc9ey8xNi92ZXJzaW9uOnZvaWQsaWQ6dm9pZCxwY2JfdHJhbnNmb3JtOnZvaWQsbWl4X3RhYmxlOnZvaWQsbWFnX2JpYXM6dm9pZCxjaGFubmVsOnZvaWQscGlkX3BhcmFtZXRlcnM6dm9pZCxzdGF0ZV9wYXJhbWV0ZXJzOnZvaWQsbGVkX3N0YXRlczpbLy92b2lkOjE2XSxuYW1lOnZvaWQsdmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6dm9pZCxpbmVydGlhbF9iaWFzOnZvaWR9O1JvdGF0aW9uPXtwaXRjaDpmMzIscm9sbDpmMzIseWF3OmYzMn07UElEU3RhdGU9e3RpbWVzdGFtcF91czp1MzIsaW5wdXQ6ZjMyLHNldHBvaW50OmYzMixwX3Rlcm06ZjMyLGlfdGVybTpmMzIsZF90ZXJtOmYzMn07UmNDb21tYW5kPXt0aHJvdHRsZTppMTYscGl0Y2g6aTE2LHJvbGw6aTE2LHlhdzppMTZ9O1N0YXRlPXsvMzIvdGltZXN0YW1wX3VzOnUzMixzdGF0dXM6U3RhdHVzRmxhZyx2MF9yYXc6dTE2LGkwX3Jhdzp1MTYsaTFfcmF3OnUxNixhY2NlbDpWZWN0b3IzZixneXJvOlZlY3RvcjNmLG1hZzpWZWN0b3IzZix0ZW1wZXJhdHVyZTp1MTYscHJlc3N1cmU6dTMyLHBwbTpbaTE2OjZdLGF1eF9jaGFuX21hc2s6dTgsY29tbWFuZDpSY0NvbW1hbmQsY29udHJvbDp7Zno6ZjMyLHR4OmYzMix0eTpmMzIsdHo6ZjMyfSxwaWRfbWFzdGVyX2Z6OlBJRFN0YXRlLHBpZF9tYXN0ZXJfdHg6UElEU3RhdGUscGlkX21hc3Rlcl90eTpQSURTdGF0ZSxwaWRfbWFzdGVyX3R6OlBJRFN0YXRlLHBpZF9zbGF2ZV9mejpQSURTdGF0ZSxwaWRfc2xhdmVfdHg6UElEU3RhdGUscGlkX3NsYXZlX3R5OlBJRFN0YXRlLHBpZF9zbGF2ZV90ejpQSURTdGF0ZSxtb3Rvcl9vdXQ6W2kxNjo4XSxraW5lbWF0aWNzX2FuZ2xlOlJvdGF0aW9uLGtpbmVtYXRpY3NfcmF0ZTpSb3RhdGlvbixraW5lbWF0aWNzX2FsdGl0dWRlOmYzMixsb29wX2NvdW50OnUzMn07U3RhdGVGaWVsZHM9ey8zMi90aW1lc3RhbXBfdXM6dm9pZCxzdGF0dXM6dm9pZCx2MF9yYXc6dm9pZCxpMF9yYXc6dm9pZCxpMV9yYXc6dm9pZCxhY2NlbDp2b2lkLGd5cm86dm9pZCxtYWc6dm9pZCx0ZW1wZXJhdHVyZTp2b2lkLHByZXNzdXJlOnZvaWQscHBtOnZvaWQsYXV4X2NoYW5fbWFzazp2b2lkLGNvbW1hbmQ6dm9pZCxjb250cm9sOnZvaWQscGlkX21hc3Rlcl9mejp2b2lkLHBpZF9tYXN0ZXJfdHg6dm9pZCxwaWRfbWFzdGVyX3R5OnZvaWQscGlkX21hc3Rlcl90ejp2b2lkLHBpZF9zbGF2ZV9mejp2b2lkLHBpZF9zbGF2ZV90eDp2b2lkLHBpZF9zbGF2ZV90eTp2b2lkLHBpZF9zbGF2ZV90ejp2b2lkLG1vdG9yX291dDp2b2lkLGtpbmVtYXRpY3NfYW5nbGU6dm9pZCxraW5lbWF0aWNzX3JhdGU6dm9pZCxraW5lbWF0aWNzX2FsdGl0dWRlOnZvaWQsbG9vcF9jb3VudDp2b2lkfTtBdXhNYXNrPXsvL2F1eDFfbG93OnZvaWQsYXV4MV9taWQ6dm9pZCxhdXgxX2hpZ2g6dm9pZCxhdXgyX2xvdzp2b2lkLGF1eDJfbWlkOnZvaWQsYXV4Ml9oaWdoOnZvaWR9O0NvbW1hbmQ9ey8zMi9yZXF1ZXN0X3Jlc3BvbnNlOnZvaWQsc2V0X2VlcHJvbV9kYXRhOkNvbmZpZ3VyYXRpb25GaXhlZCxyZWluaXRfZWVwcm9tX2RhdGE6dm9pZCxyZXF1ZXN0X2VlcHJvbV9kYXRhOnZvaWQscmVxdWVzdF9lbmFibGVfaXRlcmF0aW9uOnU4LG1vdG9yX292ZXJyaWRlX3NwZWVkXzA6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzE6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzI6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzM6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzQ6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzU6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzY6dTE2LG1vdG9yX292ZXJyaWRlX3NwZWVkXzc6dTE2LHNldF9jb21tYW5kX292ZXJyaWRlOmJvb2wsc2V0X3N0YXRlX21hc2s6U3RhdGVGaWVsZHMsc2V0X3N0YXRlX2RlbGF5OnUxNixzZXRfc2Rfd3JpdGVfZGVsYXk6dTE2LHNldF9sZWQ6e3BhdHRlcm46dTgsY29sb3JfcmlnaHRfZnJvbnQ6Q29sb3IsY29sb3JfbGVmdF9mcm9udDpDb2xvcixjb2xvcl9yaWdodF9iYWNrOkNvbG9yLGNvbG9yX2xlZnRfYmFjazpDb2xvcixpbmRpY2F0b3JfcmVkOmJvb2wsaW5kaWNhdG9yX2dyZWVuOmJvb2x9LHNldF9zZXJpYWxfcmM6e2VuYWJsZWQ6Ym9vbCxjb21tYW5kOlJjQ29tbWFuZCxhdXhfbWFzazpBdXhNYXNrfSxzZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGU6ey84L3JlY29yZF90b19jYXJkOnZvaWQsbG9ja19yZWNvcmRpbmdfc3RhdGU6dm9pZH0sc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGE6Q29uZmlndXJhdGlvbixyZWluaXRfcGFydGlhbF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uRmxhZyxyZXFfcGFydGlhbF9lZXByb21fZGF0YTpDb25maWd1cmF0aW9uRmxhZyxyZXFfY2FyZF9yZWNvcmRpbmdfc3RhdGU6dm9pZCxzZXRfcGFydGlhbF90ZW1wb3JhcnlfY29uZmlnOkNvbmZpZ3VyYXRpb24sc2V0X2NvbW1hbmRfc291cmNlczp7Lzgvc2VyaWFsOnZvaWQscmFkaW86dm9pZH0sc2V0X2NhbGlicmF0aW9uOntlbmFibGVkOmJvb2wsbW9kZTp1OH0sc2V0X2F1dG9waWxvdF9lbmFibGVkOmJvb2wsc2V0X3VzYl9tb2RlOnU4fTtEZWJ1Z1N0cmluZz17ZGVwcmVjYXRlZF9tYXNrOnUzMixtZXNzYWdlOnN9O0hpc3RvcnlEYXRhPURlYnVnU3RyaW5nO1Jlc3BvbnNlPXttYXNrOnUzMixhY2s6dTMyfTtcIn07XG4gICAgICAgIHJldHVybiB7IHZlcnNpb25zOiB2ZXJzaW9ucywgZmlsZXM6IGZpbGVzIH07XG4gICAgfVxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdjYWxpYnJhdGlvbicsIGNhbGlicmF0aW9uKTtcclxuXHJcbiAgICBjYWxpYnJhdGlvbi4kaW5qZWN0ID0gWydjb21tYW5kTG9nJywgJ3NlcmlhbCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNhbGlicmF0aW9uKGNvbW1hbmRMb2csIHNlcmlhbCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG1hZ25ldG9tZXRlcjogbWFnbmV0b21ldGVyLFxyXG4gICAgICAgICAgICBhY2NlbGVyb21ldGVyOiB7XHJcbiAgICAgICAgICAgICAgICBmbGF0OiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2ZsYXQnLCAwKSxcclxuICAgICAgICAgICAgICAgIGZvcndhcmQ6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnbGVhbiBmb3J3YXJkJywgMSksXHJcbiAgICAgICAgICAgICAgICBiYWNrOiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gYmFjaycsIDIpLFxyXG4gICAgICAgICAgICAgICAgcmlnaHQ6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnbGVhbiByaWdodCcsIDMpLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdsZWFuIGxlZnQnLCA0KSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmluaXNoOiBmaW5pc2gsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbWFnbmV0b21ldGVyKCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFwiQ2FsaWJyYXRpbmcgbWFnbmV0b21ldGVyIGJpYXNcIik7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzZXRfY2FsaWJyYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IDAsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyKHBvc2VEZXNjcmlwdGlvbiwgcG9zZUlkKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coXCJDYWxpYnJhdGluZyBncmF2aXR5IGZvciBwb3NlOiBcIiArIHBvc2VEZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzZXRfY2FsaWJyYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IHBvc2VJZCArIDEsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBmaW5pc2goKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coXCJGaW5pc2hpbmcgY2FsaWJyYXRpb25cIik7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzZXRfY2FsaWJyYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiAwLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnY29icycsIGNvYnMpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNvYnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgUmVhZGVyOiBSZWFkZXIsXHJcbiAgICAgICAgICAgIGVuY29kZTogZW5jb2RlLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIFJlYWRlcihjYXBhY2l0eSkge1xyXG4gICAgICAgIGlmIChjYXBhY2l0eSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGNhcGFjaXR5ID0gMjAwMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5OID0gY2FwYWNpdHk7XHJcbiAgICAgICAgdGhpcy5idWZmZXIgPSBuZXcgVWludDhBcnJheShjYXBhY2l0eSk7XHJcbiAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuYnVmZmVyX2xlbmd0aCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY29ic0RlY29kZShyZWFkZXIpIHtcclxuICAgICAgICB2YXIgc3JjX3B0ciA9IDA7XHJcbiAgICAgICAgdmFyIGRzdF9wdHIgPSAwO1xyXG4gICAgICAgIHZhciBsZWZ0b3Zlcl9sZW5ndGggPSAwO1xyXG4gICAgICAgIHZhciBhcHBlbmRfemVybyA9IGZhbHNlO1xyXG4gICAgICAgIHdoaWxlIChyZWFkZXIuYnVmZmVyW3NyY19wdHJdKSB7XHJcbiAgICAgICAgICAgIGlmICghbGVmdG92ZXJfbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXBwZW5kX3plcm8pXHJcbiAgICAgICAgICAgICAgICAgICAgcmVhZGVyLmJ1ZmZlcltkc3RfcHRyKytdID0gMDtcclxuICAgICAgICAgICAgICAgIGxlZnRvdmVyX2xlbmd0aCA9IHJlYWRlci5idWZmZXJbc3JjX3B0cisrXSAtIDE7XHJcbiAgICAgICAgICAgICAgICBhcHBlbmRfemVybyA9IGxlZnRvdmVyX2xlbmd0aCA8IDB4RkU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAtLWxlZnRvdmVyX2xlbmd0aDtcclxuICAgICAgICAgICAgICAgIHJlYWRlci5idWZmZXJbZHN0X3B0cisrXSA9IHJlYWRlci5idWZmZXJbc3JjX3B0cisrXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGxlZnRvdmVyX2xlbmd0aCA/IDAgOiBkc3RfcHRyO1xyXG4gICAgfVxyXG5cclxuICAgIFJlYWRlci5wcm90b3R5cGUucmVhZEJ5dGVzID0gZnVuY3Rpb24oZGF0YSwgb25TdWNjZXNzLCBvbkVycm9yKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBjID0gZGF0YVtpXTtcclxuICAgICAgICAgICAgaWYgKHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBmaXJzdCBieXRlIG9mIGEgbmV3IG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlcl9sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlclt0aGlzLmJ1ZmZlcl9sZW5ndGgrK10gPSBjO1xyXG5cclxuICAgICAgICAgICAgaWYgKGMpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJ1ZmZlcl9sZW5ndGggPT09IHRoaXMuTikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGJ1ZmZlciBvdmVyZmxvdywgcHJvYmFibHkgZHVlIHRvIGVycm9ycyBpbiBkYXRhXHJcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcignb3ZlcmZsb3cnLCAnYnVmZmVyIG92ZXJmbG93IGluIENPQlMgZGVjb2RpbmcnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5idWZmZXJfbGVuZ3RoID0gY29ic0RlY29kZSh0aGlzKTtcclxuICAgICAgICAgICAgdmFyIGZhaWxlZF9kZWNvZGUgPSAodGhpcy5idWZmZXJfbGVuZ3RoID09PSAwKTtcclxuICAgICAgICAgICAgaWYgKGZhaWxlZF9kZWNvZGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyWzBdID0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgajtcclxuICAgICAgICAgICAgZm9yIChqID0gMTsgaiA8IHRoaXMuYnVmZmVyX2xlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlclswXSBePSB0aGlzLmJ1ZmZlcltqXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5idWZmZXJbMF0gPT09IDApIHsgIC8vIGNoZWNrIHN1bSBpcyBjb3JyZWN0XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5idWZmZXJfbGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uU3VjY2Vzcyh0aGlzLmJ1ZmZlci5zbGljZSgxLCB0aGlzLmJ1ZmZlcl9sZW5ndGgpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcignc2hvcnQnLCAnVG9vIHNob3J0IHBhY2tldCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgeyAgLy8gYmFkIGNoZWNrc3VtXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB2YXIgYnl0ZXMgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHRoaXMuYnVmZmVyX2xlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnl0ZXMgKz0gdGhpcy5idWZmZXJbal0gKyBcIixcIjtcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodGhpcy5idWZmZXJbal0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGZhaWxlZF9kZWNvZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCdmcmFtZScsICdVbmV4cGVjdGVkIGVuZGluZyBvZiBwYWNrZXQnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1zZyA9ICdCQUQgQ0hFQ0tTVU0gKCcgKyB0aGlzLmJ1ZmZlcl9sZW5ndGggK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnIGJ5dGVzKScgKyBieXRlcyArIG1lc3NhZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcignY2hlY2tzdW0nLCBtc2cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBlbmNvZGUoYnVmKSB7XHJcbiAgICAgICAgdmFyIHJldHZhbCA9XHJcbiAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KE1hdGguZmxvb3IoKGJ1Zi5ieXRlTGVuZ3RoICogMjU1ICsgNzYxKSAvIDI1NCkpO1xyXG4gICAgICAgIHZhciBsZW4gPSAxO1xyXG4gICAgICAgIHZhciBwb3NfY3RyID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1Zi5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBpZiAocmV0dmFsW3Bvc19jdHJdID09IDB4RkUpIHtcclxuICAgICAgICAgICAgICAgIHJldHZhbFtwb3NfY3RyXSA9IDB4RkY7XHJcbiAgICAgICAgICAgICAgICBwb3NfY3RyID0gbGVuKys7XHJcbiAgICAgICAgICAgICAgICByZXR2YWxbcG9zX2N0cl0gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB2YWwgPSBidWZbaV07XHJcbiAgICAgICAgICAgICsrcmV0dmFsW3Bvc19jdHJdO1xyXG4gICAgICAgICAgICBpZiAodmFsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR2YWxbbGVuKytdID0gdmFsO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcG9zX2N0ciA9IGxlbisrO1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW3Bvc19jdHJdID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmV0dmFsLnN1YmFycmF5KDAsIGxlbikuc2xpY2UoKS5idWZmZXI7XHJcbiAgICB9O1xyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdjb21tYW5kTG9nJywgY29tbWFuZExvZyk7XHJcblxyXG4gICAgY29tbWFuZExvZy4kaW5qZWN0ID0gWyckcSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNvbW1hbmRMb2coJHEpIHtcclxuICAgICAgICB2YXIgbWVzc2FnZXMgPSBbXTtcclxuICAgICAgICB2YXIgcmVzcG9uZGVyID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgdmFyIHNlcnZpY2UgPSBsb2c7XHJcbiAgICAgICAgc2VydmljZS5sb2cgPSBsb2c7XHJcbiAgICAgICAgc2VydmljZS5jbGVhclN1YnNjcmliZXJzID0gY2xlYXJTdWJzY3JpYmVycztcclxuICAgICAgICBzZXJ2aWNlLm9uTWVzc2FnZSA9IG9uTWVzc2FnZTtcclxuICAgICAgICBzZXJ2aWNlLnJlYWQgPSByZWFkO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VydmljZTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbG9nKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIHJlc3BvbmRlci5ub3RpZnkocmVhZCgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVhZCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2VzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2xlYXJTdWJzY3JpYmVycygpIHtcclxuICAgICAgICAgICAgcmVzcG9uZGVyID0gJHEuZGVmZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uTWVzc2FnZShjYWxsYmFjaykge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uZGVyLnByb21pc2UudGhlbih1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2FsbGJhY2spO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnZGV2aWNlQ29uZmlnJywgZGV2aWNlQ29uZmlnKTtcclxuXHJcbiAgICBkZXZpY2VDb25maWcuJGluamVjdCA9IFsnc2VyaWFsJywgJ2NvbW1hbmRMb2cnLCAnZmlybXdhcmVWZXJzaW9uJywgJ3NlcmlhbGl6YXRpb25IYW5kbGVyJ107XHJcblxyXG4gICAgZnVuY3Rpb24gZGV2aWNlQ29uZmlnKHNlcmlhbCwgY29tbWFuZExvZywgZmlybXdhcmVWZXJzaW9uLCBzZXJpYWxpemF0aW9uSGFuZGxlcikge1xyXG4gICAgICAgIHZhciBjb25maWc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdObyBjYWxsYmFjayBkZWZpbmVkIGZvciByZWNlaXZpbmcgY29uZmlndXJhdGlvbnMhJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGxvZ2dpbmdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFxyXG4gICAgICAgICAgICAgICAgJ05vIGNhbGxiYWNrIGRlZmluZWQgZm9yIHJlY2VpdmluZyBsb2dnaW5nIHN0YXRlIScgK1xyXG4gICAgICAgICAgICAgICAgJyBDYWxsYmFjayBhcmd1bWVudHM6IChpc0xvZ2dpbmcsIGlzTG9ja2VkLCBkZWxheSknKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZXJpYWwuYWRkT25SZWNlaXZlQ2FsbGJhY2soZnVuY3Rpb24obWVzc2FnZVR5cGUsIG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlICE9PSAnQ29tbWFuZCcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJ3NldF9lZXByb21fZGF0YScgaW4gbWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlQ29uZmlnRnJvbVJlbW90ZURhdGEobWVzc2FnZS5zZXRfZWVwcm9tX2RhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgnc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGEnIGluIG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUNvbmZpZ0Zyb21SZW1vdGVEYXRhKG1lc3NhZ2Uuc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgoJ3NldF9jYXJkX3JlY29yZGluZ19zdGF0ZScgaW4gbWVzc2FnZSkgJiYgKCdzZXRfc2Rfd3JpdGVfZGVsYXknIGluIG1lc3NhZ2UpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2FyZF9yZWNfc3RhdGUgPSBtZXNzYWdlLnNldF9jYXJkX3JlY29yZGluZ19zdGF0ZTtcclxuICAgICAgICAgICAgICAgIHZhciBzZF93cml0ZV9kZWxheSA9IG1lc3NhZ2Uuc2V0X3NkX3dyaXRlX2RlbGF5O1xyXG4gICAgICAgICAgICAgICAgbG9nZ2luZ0NhbGxiYWNrKGNhcmRfcmVjX3N0YXRlLnJlY29yZF90b19jYXJkLCBjYXJkX3JlY19zdGF0ZS5sb2NrX3JlY29yZGluZ19zdGF0ZSwgc2Rfd3JpdGVfZGVsYXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldERlc2lyZWRWZXJzaW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmlybXdhcmVWZXJzaW9uLmRlc2lyZWQoKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZXF1ZXN0KCkge1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlcnMgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKTtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnUmVxdWVzdGluZyBjdXJyZW50IGNvbmZpZ3VyYXRpb24gZGF0YS4uLicpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcmVxX3BhcnRpYWxfZWVwcm9tX2RhdGE6IGhhbmRsZXJzLkNvbmZpZ3VyYXRpb25GbGFnLmVtcHR5KCksXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlaW5pdCgpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnU2V0dGluZyBmYWN0b3J5IGRlZmF1bHQgY29uZmlndXJhdGlvbiBkYXRhLi4uJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZWluaXRfZWVwcm9tX2RhdGE6IHRydWUsXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdSZXF1ZXN0IGZvciBmYWN0b3J5IHJlc2V0IGZhaWxlZDogJyArIHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZW5kKG5ld0NvbmZpZykge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VuZENvbmZpZyh7IGNvbmZpZzogbmV3Q29uZmlnLCB0ZW1wb3Jhcnk6IGZhbHNlLCByZXF1ZXN0VXBkYXRlOiB0cnVlIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZENvbmZpZyhwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVycyA9IGZpcm13YXJlVmVyc2lvbi5zZXJpYWxpemF0aW9uSGFuZGxlcigpO1xyXG4gICAgICAgICAgICB2YXIgbWFzayA9IHByb3BlcnRpZXMubWFzayB8fCBoYW5kbGVycy5Db25maWd1cmF0aW9uRmxhZy5lbXB0eSgpO1xyXG4gICAgICAgICAgICB2YXIgbmV3Q29uZmlnID0gcHJvcGVydGllcy5jb25maWcgfHwgY29uZmlnO1xyXG4gICAgICAgICAgICB2YXIgcmVxdWVzdFVwZGF0ZSA9IHByb3BlcnRpZXMucmVxdWVzdFVwZGF0ZSB8fCBmYWxzZTtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAocHJvcGVydGllcy50ZW1wb3JhcnkpIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0X3BhcnRpYWxfdGVtcG9yYXJ5X2NvbmZpZyA9IG5ld0NvbmZpZztcclxuICAgICAgICAgICAgICAgIG1hc2sgPSB7IHNldF9wYXJ0aWFsX3RlbXBvcmFyeV9jb25maWc6IG1hc2sgfTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGEgPSBuZXdDb25maWc7XHJcbiAgICAgICAgICAgICAgICBtYXNrID0geyBzZXRfcGFydGlhbF9lZXByb21fZGF0YTogbWFzayB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIG1lc3NhZ2UsIHRydWUsIG1hc2spLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdFVwZGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVDb25maWdGcm9tUmVtb3RlRGF0YShjb25maWdDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIC8vY29tbWFuZExvZygnUmVjZWl2ZWQgY29uZmlnIScpO1xyXG4gICAgICAgICAgICBjb25maWcgPSBzZXJpYWxpemF0aW9uSGFuZGxlci51cGRhdGVGaWVsZHMoY29uZmlnLCBjb25maWdDaGFuZ2VzKTtcclxuICAgICAgICAgICAgdmFyIHZlcnNpb24gPSBbY29uZmlnLnZlcnNpb24ubWFqb3IsIGNvbmZpZy52ZXJzaW9uLm1pbm9yLCBjb25maWcudmVyc2lvbi5wYXRjaF07XHJcbiAgICAgICAgICAgIGZpcm13YXJlVmVyc2lvbi5zZXQodmVyc2lvbik7XHJcbiAgICAgICAgICAgIGlmICghZmlybXdhcmVWZXJzaW9uLnN1cHBvcnRlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdSZWNlaXZlZCBhbiB1bnN1cHBvcnRlZCBjb25maWd1cmF0aW9uIScpO1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICAgICAnRm91bmQgdmVyc2lvbjogJyArIHZlcnNpb25bMF0gKyAnLicgKyB2ZXJzaW9uWzFdICsgJy4nICsgdmVyc2lvblsyXSAgK1xyXG4gICAgICAgICAgICAgICAgICAgICcgLS0tIE5ld2VzdCB2ZXJzaW9uOiAnICtcclxuICAgICAgICAgICAgICAgICAgICBmaXJtd2FyZVZlcnNpb24uZGVzaXJlZEtleSgpICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICdSZWNlaXZlZCBjb25maWd1cmF0aW9uIGRhdGEgKHYnICtcclxuICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uWzBdICsgJy4nICsgdmVyc2lvblsxXSArICcuJyArIHZlcnNpb25bMl0gKycpJyk7XHJcbiAgICAgICAgICAgICAgICBjb25maWdDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRDb25maWdDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBjb25maWdDYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0TG9nZ2luZ0NhbGxiYWNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGxvZ2dpbmdDYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0Q29uZmlnKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY29uZmlnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uZmlnID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCkuQ29uZmlndXJhdGlvbi5lbXB0eSgpO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXF1ZXN0OiByZXF1ZXN0LFxyXG4gICAgICAgICAgICByZWluaXQ6IHJlaW5pdCxcclxuICAgICAgICAgICAgc2VuZDogc2VuZCxcclxuICAgICAgICAgICAgc2VuZENvbmZpZzogc2VuZENvbmZpZyxcclxuICAgICAgICAgICAgZ2V0Q29uZmlnOiBnZXRDb25maWcsXHJcbiAgICAgICAgICAgIHNldENvbmZpZ0NhbGxiYWNrOiBzZXRDb25maWdDYWxsYmFjayxcclxuICAgICAgICAgICAgc2V0TG9nZ2luZ0NhbGxiYWNrOiBzZXRMb2dnaW5nQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGdldERlc2lyZWRWZXJzaW9uOiBnZXREZXNpcmVkVmVyc2lvbixcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdmaXJtd2FyZVZlcnNpb24nLCBmaXJtd2FyZVZlcnNpb24pO1xyXG5cclxuICAgIGZpcm13YXJlVmVyc2lvbi4kaW5qZWN0ID0gWydzZXJpYWxpemF0aW9uSGFuZGxlciddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGZpcm13YXJlVmVyc2lvbihzZXJpYWxpemF0aW9uSGFuZGxlcikge1xyXG4gICAgICAgIHZhciB2ZXJzaW9uID0gWzAsIDAsIDBdO1xyXG4gICAgICAgIHZhciBrZXkgPSAnMC4wLjAnO1xyXG5cclxuICAgICAgICB2YXIgbmV3ZXN0VmVyc2lvbiA9IHNlcmlhbGl6YXRpb25IYW5kbGVyLmdldE5ld2VzdFZlcnNpb24oKTtcclxuXHJcbiAgICAgICAgdmFyIGRlc2lyZWQgPSBbbmV3ZXN0VmVyc2lvbi5tYWpvciwgbmV3ZXN0VmVyc2lvbi5taW5vciwgbmV3ZXN0VmVyc2lvbi5wYXRjaF07XHJcbiAgICAgICAgdmFyIGRlc2lyZWRLZXkgPSBkZXNpcmVkWzBdLnRvU3RyaW5nKCkgKyAnLicgKyBkZXNpcmVkWzFdLnRvU3RyaW5nKCkgKyAnLicgKyBkZXNpcmVkWzJdLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgIHZhciBkZWZhdWx0U2VyaWFsaXphdGlvbkhhbmRsZXIgPSBzZXJpYWxpemF0aW9uSGFuZGxlci5nZXRIYW5kbGVyKGRlc2lyZWRLZXkpO1xyXG4gICAgICAgIHZhciBjdXJyZW50U2VyaWFsaXphdGlvbkhhbmRsZXIgPSBkZWZhdWx0U2VyaWFsaXphdGlvbkhhbmRsZXI7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHZlcnNpb24gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGtleSA9IHZhbHVlLmpvaW4oJy4nKTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRTZXJpYWxpemF0aW9uSGFuZGxlciA9XHJcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsaXphdGlvbkhhbmRsZXIuZ2V0SGFuZGxlcihkZXNpcmVkS2V5KSB8fCBkZWZhdWx0U2VyaWFsaXphdGlvbkhhbmRsZXI7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmVyc2lvbjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAga2V5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBrZXk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN1cHBvcnRlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gISFzZXJpYWxpemF0aW9uSGFuZGxlci5nZXRIYW5kbGVyKGtleSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRlc2lyZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlc2lyZWQ7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRlc2lyZWRLZXk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlc2lyZWRLZXk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNlcmlhbGl6YXRpb25IYW5kbGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50U2VyaWFsaXphdGlvbkhhbmRsZXI7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdsZWQnLCBsZWQpO1xyXG5cclxuICAgIGxlZC4kaW5qZWN0ID0gWyckcScsICdzZXJpYWwnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBsZWQoJHEsIHNlcmlhbCkge1xyXG4gICAgICAgIHZhciBMZWRQYXR0ZXJucyA9IHtcclxuICAgICAgICAgICAgTk9fT1ZFUlJJREU6IDAsXHJcbiAgICAgICAgICAgIEZMQVNIOiAxLFxyXG4gICAgICAgICAgICBCRUFDT046IDIsXHJcbiAgICAgICAgICAgIEJSRUFUSEU6IDMsXHJcbiAgICAgICAgICAgIEFMVEVSTkFURTogNCxcclxuICAgICAgICAgICAgU09MSUQ6IDUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIHVyZ2VudCA9IGZhbHNlO1xyXG4gICAgICAgIHZhciBibGFjayA9IHtyZWQ6IDAsIGdyZWVuOiAwLCBibHVlOiAwfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0KHJpZ2h0X2Zyb250LCByaWdodF9iYWNrLCBsZWZ0X2Zyb250LCBsZWZ0X2JhY2ssIHBhdHRlcm4sIHJlZCwgZ3JlZW4pIHtcclxuICAgICAgICAgICAgaWYgKCF1cmdlbnQgJiYgc2VyaWFsLmJ1c3koKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCgnU2VyaWFsIGNvbm5lY3Rpb24gaXMgdG9vIGJ1c3knKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB1cmdlbnQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuIHx8IExlZFBhdHRlcm5zLk5PX09WRVJSSURFO1xyXG4gICAgICAgICAgICBpZiAocGF0dGVybiA8IDApIHtcclxuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBMZWRQYXR0ZXJucy5OT19PVkVSUklERTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChwYXR0ZXJuID4gNSkge1xyXG4gICAgICAgICAgICAgICAgcGF0dGVybiA9IExlZFBhdHRlcm5zLlNPTElEO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgc2V0dGVyX2NvbW1hbmQgPSB7XHJcbiAgICAgICAgICAgICAgICBwYXR0ZXJuOiBwYXR0ZXJuLFxyXG4gICAgICAgICAgICAgICAgY29sb3JfcmlnaHQ6IHJpZ2h0X2Zyb250IHx8IGJsYWNrLFxyXG4gICAgICAgICAgICAgICAgY29sb3JfbGVmdDogbGVmdF9mcm9udCB8fCBibGFjayxcclxuICAgICAgICAgICAgICAgIGNvbG9yX3JpZ2h0X2Zyb250OiByaWdodF9mcm9udCB8fCBibGFjayxcclxuICAgICAgICAgICAgICAgIGNvbG9yX2xlZnRfZnJvbnQ6IGxlZnRfZnJvbnQgfHwgYmxhY2ssXHJcbiAgICAgICAgICAgICAgICBjb2xvcl9yaWdodF9iYWNrOiByaWdodF9iYWNrIHx8IGJsYWNrLFxyXG4gICAgICAgICAgICAgICAgY29sb3JfbGVmdF9iYWNrOiBsZWZ0X2JhY2sgfHwgYmxhY2ssXHJcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3JfcmVkOiByZWQsXHJcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3JfZ3JlZW46IGdyZWVuLFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNldF9sZWQ6IHNldHRlcl9jb21tYW5kLFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRTaW1wbGUocmVkLCBncmVlbiwgYmx1ZSkge1xyXG4gICAgICAgICAgICB2YXIgY29sb3IgPSB7cmVkOiByZWQgfHwgMCwgZ3JlZW46IGdyZWVuIHx8IDAsIGJsdWU6IGJsdWUgfHwgMH07XHJcbiAgICAgICAgICAgIHJldHVybiBzZXQoY29sb3IsIGNvbG9yLCBjb2xvciwgY29sb3IsIExlZFBhdHRlcm5zLlNPTElEKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNsZWFyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2V0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBmb3JjZU5leHRTZW5kKCkge1xyXG4gICAgICAgICAgICB1cmdlbnQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2V0OiBzZXQsXHJcbiAgICAgICAgICAgIHNldFNpbXBsZTogc2V0U2ltcGxlLFxyXG4gICAgICAgICAgICBjbGVhcjogY2xlYXIsXHJcbiAgICAgICAgICAgIHBhdHRlcm5zOiBMZWRQYXR0ZXJucyxcclxuICAgICAgICAgICAgZm9yY2VOZXh0U2VuZDogZm9yY2VOZXh0U2VuZCxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgncmNEYXRhJywgcmNEYXRhKTtcclxuXHJcbiAgICByY0RhdGEuJGluamVjdCA9IFsnc2VyaWFsJ107XHJcblxyXG4gICAgZnVuY3Rpb24gcmNEYXRhKHNlcmlhbCkge1xyXG4gICAgICAgIHZhciBBVVggPSB7XHJcbiAgICAgICAgICAgIExPVzogMCxcclxuICAgICAgICAgICAgTUlEOiAxLFxyXG4gICAgICAgICAgICBISUdIOiAyLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIGF1eE5hbWVzID0gWydsb3cnLCAnbWlkJywgJ2hpZ2gnXTtcclxuXHJcbiAgICAgICAgdmFyIHRocm90dGxlID0gLTE7XHJcbiAgICAgICAgdmFyIHBpdGNoID0gMDtcclxuICAgICAgICB2YXIgcm9sbCA9IDA7XHJcbiAgICAgICAgdmFyIHlhdyA9IDA7XHJcbiAgICAgICAgLy8gZGVmYXVsdHMgdG8gaGlnaCAtLSBsb3cgaXMgZW5hYmxpbmc7IGhpZ2ggaXMgZGlzYWJsaW5nXHJcbiAgICAgICAgdmFyIGF1eDEgPSBBVVguSElHSDtcclxuICAgICAgICAvLyBkZWZhdWx0cyB0byA/PyAtLSBuZWVkIHRvIGNoZWNrIHRyYW5zbWl0dGVyIGJlaGF2aW9yXHJcbiAgICAgICAgdmFyIGF1eDIgPSBBVVguSElHSDtcclxuXHJcbiAgICAgICAgdmFyIHVyZ2VudCA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNldFRocm90dGxlOiBzZXRUaHJvdHRsZSxcclxuICAgICAgICAgICAgc2V0UGl0Y2g6IHNldFBpdGNoLFxyXG4gICAgICAgICAgICBzZXRSb2xsOiBzZXRSb2xsLFxyXG4gICAgICAgICAgICBzZXRZYXc6IHNldFlhdyxcclxuICAgICAgICAgICAgc2V0QXV4MTogc2V0QXV4MSxcclxuICAgICAgICAgICAgc2V0QXV4Mjogc2V0QXV4MixcclxuICAgICAgICAgICAgZ2V0VGhyb3R0bGU6IGdldFRocm90dGxlLFxyXG4gICAgICAgICAgICBnZXRQaXRjaDogZ2V0UGl0Y2gsXHJcbiAgICAgICAgICAgIGdldFJvbGw6IGdldFJvbGwsXHJcbiAgICAgICAgICAgIGdldFlhdzogZ2V0WWF3LFxyXG4gICAgICAgICAgICBnZXRBdXgxOiBnZXRBdXgxLFxyXG4gICAgICAgICAgICBnZXRBdXgyOiBnZXRBdXgyLFxyXG4gICAgICAgICAgICBBVVg6IEFVWCxcclxuICAgICAgICAgICAgc2VuZDogc2VuZCxcclxuICAgICAgICAgICAgZm9yY2VOZXh0U2VuZDogZm9yY2VOZXh0U2VuZCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZW5kKCkge1xyXG4gICAgICAgICAgICBpZiAoIXVyZ2VudCAmJiBzZXJpYWwuYnVzeSgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdXJnZW50ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICB2YXIgY29tbWFuZCA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy8gaW52ZXJ0IHBpdGNoIGFuZCByb2xsXHJcbiAgICAgICAgICAgIHZhciB0aHJvdHRsZV90aHJlc2hvbGQgPVxyXG4gICAgICAgICAgICAgICAgLTAuODsgIC8vIGtlZXAgYm90dG9tIDEwJSBvZiB0aHJvdHRsZSBzdGljayB0byBtZWFuICdvZmYnXHJcbiAgICAgICAgICAgIGNvbW1hbmQudGhyb3R0bGUgPSBjb25zdHJhaW4oXHJcbiAgICAgICAgICAgICAgICAodGhyb3R0bGUgLSB0aHJvdHRsZV90aHJlc2hvbGQpICogNDA5NSAvXHJcbiAgICAgICAgICAgICAgICAgICAgKDEgLSB0aHJvdHRsZV90aHJlc2hvbGQpLFxyXG4gICAgICAgICAgICAgICAgMCwgNDA5NSk7XHJcbiAgICAgICAgICAgIGNvbW1hbmQucGl0Y2ggPVxyXG4gICAgICAgICAgICAgICAgY29uc3RyYWluKC0oYXBwbHlEZWFkem9uZShwaXRjaCwgMC4xKSkgKiA0MDk1IC8gMiwgLTIwNDcsIDIwNDcpO1xyXG4gICAgICAgICAgICBjb21tYW5kLnJvbGwgPVxyXG4gICAgICAgICAgICAgICAgY29uc3RyYWluKChhcHBseURlYWR6b25lKHJvbGwsIDAuMSkpICogNDA5NSAvIDIsIC0yMDQ3LCAyMDQ3KTtcclxuICAgICAgICAgICAgY29tbWFuZC55YXcgPVxyXG4gICAgICAgICAgICAgICAgY29uc3RyYWluKC0oYXBwbHlEZWFkem9uZSh5YXcsIDAuMSkpICogNDA5NSAvIDIsIC0yMDQ3LCAyMDQ3KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBhdXhfbWFzayA9IHt9O1xyXG4gICAgICAgICAgICAvLyBhdXgxX2xvdywgYXV4MV9taWQsIGF1eDFfaGlnaCwgYW5kIHNhbWUgd2l0aCBhdXgyXHJcbiAgICAgICAgICAgIGF1eF9tYXNrWydhdXgxXycgKyBhdXhOYW1lc1thdXgxXV0gPSB0cnVlO1xyXG4gICAgICAgICAgICBhdXhfbWFza1snYXV4Ml8nICsgYXV4TmFtZXNbYXV4Ml1dID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzZXRfc2VyaWFsX3JjOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBjb21tYW5kOiBjb21tYW5kLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1eF9tYXNrOiBhdXhfbWFzayxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFRocm90dGxlKHYpIHtcclxuICAgICAgICAgICAgdGhyb3R0bGUgPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0UGl0Y2godikge1xyXG4gICAgICAgICAgICBwaXRjaCA9IHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRSb2xsKHYpIHtcclxuICAgICAgICAgICAgcm9sbCA9IHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRZYXcodikge1xyXG4gICAgICAgICAgICB5YXcgPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0QXV4MSh2KSB7XHJcbiAgICAgICAgICAgIGF1eDEgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigyLCB2KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRBdXgyKHYpIHtcclxuICAgICAgICAgICAgYXV4MiA9IE1hdGgubWF4KDAsIE1hdGgubWluKDIsIHYpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFRocm90dGxlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhyb3R0bGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRQaXRjaCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBpdGNoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0Um9sbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJvbGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRZYXcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB5YXc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRBdXgxKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXV4MTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldEF1eDIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhdXgyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZm9yY2VOZXh0U2VuZCgpIHtcclxuICAgICAgICAgICAgdXJnZW50ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNvbnN0cmFpbih4LCB4bWluLCB4bWF4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLm1heCh4bWluLCBNYXRoLm1pbih4LCB4bWF4KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhcHBseURlYWR6b25lKHZhbHVlLCBkZWFkem9uZSkge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPiBkZWFkem9uZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlIC0gZGVhZHpvbmU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHZhbHVlIDwgLWRlYWR6b25lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgKyBkZWFkem9uZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ3NlcmlhbCcsIHNlcmlhbCk7XHJcblxyXG4gICAgc2VyaWFsLiRpbmplY3QgPSBbJyR0aW1lb3V0JywgJyRxJywgJ2NvYnMnLCAnY29tbWFuZExvZycsICdmaXJtd2FyZVZlcnNpb24nLCAnc2VyaWFsaXphdGlvbkhhbmRsZXInXTtcclxuXHJcbiAgICBmdW5jdGlvbiBzZXJpYWwoJHRpbWVvdXQsICRxLCBjb2JzLCBjb21tYW5kTG9nLCBmaXJtd2FyZVZlcnNpb24sIHNlcmlhbGl6YXRpb25IYW5kbGVyKSB7XHJcbiAgICAgICAgdmFyIE1lc3NhZ2VUeXBlID0ge1xyXG4gICAgICAgICAgICBTdGF0ZTogMCxcclxuICAgICAgICAgICAgQ29tbWFuZDogMSxcclxuICAgICAgICAgICAgRGVidWdTdHJpbmc6IDMsXHJcbiAgICAgICAgICAgIEhpc3RvcnlEYXRhOiA0LFxyXG4gICAgICAgICAgICBQcm90b2NvbDogMTI4LFxyXG4gICAgICAgICAgICBSZXNwb25zZTogMjU1LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBhY2tub3dsZWRnZXMgPSBbXTtcclxuICAgICAgICB2YXIgYmFja2VuZCA9IG5ldyBCYWNrZW5kKCk7XHJcblxyXG4gICAgICAgIHZhciBvblJlY2VpdmVMaXN0ZW5lcnMgPSBbXTtcclxuXHJcbiAgICAgICAgdmFyIGNvYnNSZWFkZXIgPSBuZXcgY29icy5SZWFkZXIoMTAwMDApO1xyXG4gICAgICAgIHZhciBieXRlc0hhbmRsZXIgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEJhY2tlbmQoKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBCYWNrZW5kLnByb3RvdHlwZS5idXN5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBCYWNrZW5kLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdObyBcInNlbmRcIiBkZWZpbmVkIGZvciBzZXJpYWwgYmFja2VuZCcpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIEJhY2tlbmQucHJvdG90eXBlLm9uUmVhZCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gXCJvblJlYWRcIiBkZWZpbmVkIGZvciBzZXJpYWwgYmFja2VuZCcpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBNZXNzYWdlVHlwZUludmVyc2lvbiA9IFtdO1xyXG4gICAgICAgIE9iamVjdC5rZXlzKE1lc3NhZ2VUeXBlKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICBNZXNzYWdlVHlwZUludmVyc2lvbltNZXNzYWdlVHlwZVtrZXldXSA9IGtleTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgYWRkT25SZWNlaXZlQ2FsbGJhY2soZnVuY3Rpb24obWVzc2FnZVR5cGUsIG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlID09PSAnUmVzcG9uc2UnKSB7XHJcbiAgICAgICAgICAgICAgICBhY2tub3dsZWRnZShtZXNzYWdlLm1hc2ssIG1lc3NhZ2UuYWNrKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChtZXNzYWdlVHlwZSA9PT0gJ1Byb3RvY29sJykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBtZXNzYWdlLnJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uSGFuZGxlci5hZGRIYW5kbGVyKGRhdGEudmVyc2lvbiwgZGF0YS5zdHJ1Y3R1cmUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGJ1c3k6IGJ1c3ksXHJcbiAgICAgICAgICAgIHNlbmRTdHJ1Y3R1cmU6IHNlbmRTdHJ1Y3R1cmUsXHJcbiAgICAgICAgICAgIHNldEJhY2tlbmQ6IHNldEJhY2tlbmQsXHJcbiAgICAgICAgICAgIGFkZE9uUmVjZWl2ZUNhbGxiYWNrOiBhZGRPblJlY2VpdmVDYWxsYmFjayxcclxuICAgICAgICAgICAgcmVtb3ZlT25SZWNlaXZlQ2FsbGJhY2s6IHJlbW92ZU9uUmVjZWl2ZUNhbGxiYWNrLFxyXG4gICAgICAgICAgICBzZXRCeXRlc0hhbmRsZXI6IHNldEJ5dGVzSGFuZGxlcixcclxuICAgICAgICAgICAgaGFuZGxlUG9zdENvbm5lY3Q6IGhhbmRsZVBvc3RDb25uZWN0LFxyXG4gICAgICAgICAgICBCYWNrZW5kOiBCYWNrZW5kLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEJhY2tlbmQodikge1xyXG4gICAgICAgICAgICBiYWNrZW5kID0gdjtcclxuICAgICAgICAgICAgYmFja2VuZC5vblJlYWQgPSByZWFkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlUG9zdENvbm5lY3QoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0RmlybXdhcmVWZXJzaW9uKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZXF1ZXN0RmlybXdhcmVWZXJzaW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXFfcGFydGlhbF9lZXByb21fZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb246IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmRTdHJ1Y3R1cmUobWVzc2FnZVR5cGUsIGRhdGEsIGxvZ19zZW5kLCBleHRyYU1hc2spIHtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlID09PSAnU3RhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gcHJvY2Vzc1N0YXRlT3V0cHV0KGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVycyA9IGZpcm13YXJlVmVyc2lvbi5zZXJpYWxpemF0aW9uSGFuZGxlcigpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgaWYgKCEobWVzc2FnZVR5cGUgaW4gTWVzc2FnZVR5cGUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZS5yZWplY3QoJ01lc3NhZ2UgdHlwZSBcIicgKyBtZXNzYWdlVHlwZSArXHJcbiAgICAgICAgICAgICAgICAgICAgJ1wiIG5vdCBzdXBwb3J0ZWQgYnkgYXBwLCBzdXBwb3J0ZWQgbWVzc2FnZSB0eXBlcyBhcmU6JyArXHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoTWVzc2FnZVR5cGUpLmpvaW4oJywgJykpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnByb21pc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCEobWVzc2FnZVR5cGUgaW4gaGFuZGxlcnMpKSB7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZS5yZWplY3QoJ01lc3NhZ2UgdHlwZSBcIicgKyBtZXNzYWdlVHlwZSArXHJcbiAgICAgICAgICAgICAgICAgICAgJ1wiIG5vdCBzdXBwb3J0ZWQgYnkgZmlybXdhcmUsIHN1cHBvcnRlZCBtZXNzYWdlIHR5cGVzIGFyZTonICtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhoYW5kbGVycykuam9pbignLCAnKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdHlwZUNvZGUgPSBNZXNzYWdlVHlwZVttZXNzYWdlVHlwZV07XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gaGFuZGxlcnNbbWVzc2FnZVR5cGVdO1xyXG5cclxuICAgICAgICAgICAgdmFyIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGhhbmRsZXIuYnl0ZUNvdW50KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBzZXJpYWxpemVyID0gbmV3IHNlcmlhbGl6YXRpb25IYW5kbGVyLlNlcmlhbGl6ZXIobmV3IERhdGFWaWV3KGJ1ZmZlci5idWZmZXIpKTtcclxuICAgICAgICAgICAgaGFuZGxlci5lbmNvZGUoc2VyaWFsaXplciwgZGF0YSwgZXh0cmFNYXNrKTtcclxuICAgICAgICAgICAgdmFyIG1hc2sgPSBoYW5kbGVyLm1hc2tBcnJheShkYXRhLCBleHRyYU1hc2spO1xyXG4gICAgICAgICAgICBpZiAobWFzay5sZW5ndGggPCA1KSB7XHJcbiAgICAgICAgICAgICAgICBtYXNrID0gKG1hc2tbMF0gPDwgMCkgfCAobWFza1sxXSA8PCA4KSB8IChtYXNrWzJdIDw8IDE2KSB8IChtYXNrWzNdIDw8IDI0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGRhdGFMZW5ndGggPSBzZXJpYWxpemVyLmluZGV4O1xyXG5cclxuICAgICAgICAgICAgdmFyIG91dHB1dCA9IG5ldyBVaW50OEFycmF5KGRhdGFMZW5ndGggKyAzKTtcclxuICAgICAgICAgICAgb3V0cHV0WzBdID0gb3V0cHV0WzFdID0gdHlwZUNvZGU7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGRhdGFMZW5ndGg7ICsraWR4KSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXRbMF0gXj0gb3V0cHV0W2lkeCArIDJdID0gYnVmZmVyW2lkeF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3V0cHV0W2RhdGFMZW5ndGggKyAyXSA9IDA7XHJcblxyXG4gICAgICAgICAgICBhY2tub3dsZWRnZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBtYXNrOiBtYXNrLFxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2U6IHJlc3BvbnNlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgYmFja2VuZC5zZW5kKG5ldyBVaW50OEFycmF5KGNvYnMuZW5jb2RlKG91dHB1dCkpKTtcclxuICAgICAgICAgICAgfSwgMCk7XHJcblxyXG4gICAgICAgICAgICBpZiAobG9nX3NlbmQpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coJ1NlbmRpbmcgY29tbWFuZCAnICsgdHlwZUNvZGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucHJvbWlzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGJ1c3koKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiYWNrZW5kLmJ1c3koKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEJ5dGVzSGFuZGxlcihoYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIGJ5dGVzSGFuZGxlciA9IGhhbmRsZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZWFkKGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKGJ5dGVzSGFuZGxlcilcclxuICAgICAgICAgICAgICAgIGJ5dGVzSGFuZGxlcihkYXRhLCBwcm9jZXNzRGF0YSk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGNvYnNSZWFkZXIucmVhZEJ5dGVzKGRhdGEsIHByb2Nlc3NEYXRhLCByZXBvcnRJc3N1ZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVwb3J0SXNzdWVzKGlzc3VlLCB0ZXh0KSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ0NPQlMgZGVjb2RpbmcgZmFpbGVkICgnICsgaXNzdWUgKyAnKTogJyArIHRleHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWRkT25SZWNlaXZlQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgb25SZWNlaXZlTGlzdGVuZXJzID0gb25SZWNlaXZlTGlzdGVuZXJzLmNvbmNhdChbY2FsbGJhY2tdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZU9uUmVjZWl2ZUNhbGxiYWNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIG9uUmVjZWl2ZUxpc3RlbmVycyA9IG9uUmVjZWl2ZUxpc3RlbmVycy5maWx0ZXIoZnVuY3Rpb24oY2IpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjYiAhPT0gY2FsbGJhY2s7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWNrbm93bGVkZ2UobWFzaywgdmFsdWUpIHtcclxuICAgICAgICAgICAgd2hpbGUgKGFja25vd2xlZGdlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdiA9IGFja25vd2xlZGdlcy5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHYubWFzayBeIG1hc2spIHtcclxuICAgICAgICAgICAgICAgICAgICB2LnJlc3BvbnNlLnJlamVjdCgnTWlzc2luZyBBQ0snKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciByZWxheGVkTWFzayA9IG1hc2s7XHJcbiAgICAgICAgICAgICAgICByZWxheGVkTWFzayAmPSB+MTtcclxuICAgICAgICAgICAgICAgIGlmIChyZWxheGVkTWFzayBeIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdi5yZXNwb25zZS5yZWplY3QoJ1JlcXVlc3Qgd2FzIG5vdCBmdWxseSBwcm9jZXNzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHYucmVzcG9uc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByb2Nlc3NEYXRhKGJ5dGVzKSB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlVHlwZSA9IE1lc3NhZ2VUeXBlSW52ZXJzaW9uW2J5dGVzWzBdXTtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKVttZXNzYWdlVHlwZV07XHJcbiAgICAgICAgICAgIGlmICghbWVzc2FnZVR5cGUgfHwgIWhhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coJ0lsbGVnYWwgbWVzc2FnZSB0eXBlIHBhc3NlZCBmcm9tIGZpcm13YXJlJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHZhciBzZXJpYWxpemVyID0gbmV3IHNlcmlhbGl6YXRpb25IYW5kbGVyLlNlcmlhbGl6ZXIobmV3IERhdGFWaWV3KGJ5dGVzLmJ1ZmZlciwgMSkpO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBoYW5kbGVyLmRlY29kZShzZXJpYWxpemVyKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdVbnJlY29nbml6ZWQgbWVzc2FnZSBmb3JtYXQgcmVjZWl2ZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWVzc2FnZVR5cGUgPT09ICdTdGF0ZScpIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBwcm9jZXNzU3RhdGVJbnB1dChtZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvblJlY2VpdmVMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbihsaXN0ZW5lcikge1xyXG4gICAgICAgICAgICAgICAgbGlzdGVuZXIobWVzc2FnZVR5cGUsIG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBsYXN0X3RpbWVzdGFtcF91cyA9IDA7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByb2Nlc3NTdGF0ZUlucHV0KHN0YXRlKSB7XHJcbiAgICAgICAgICAgIHN0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUpO1xyXG4gICAgICAgICAgICB2YXIgc2VyaWFsX3VwZGF0ZV9yYXRlX0h6ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmICgndGltZXN0YW1wX3VzJyBpbiBzdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUuc2VyaWFsX3VwZGF0ZV9yYXRlX2VzdGltYXRlID0gMTAwMDAwMCAvIChzdGF0ZS50aW1lc3RhbXBfdXMgLSBsYXN0X3RpbWVzdGFtcF91cyk7XHJcbiAgICAgICAgICAgICAgICBsYXN0X3RpbWVzdGFtcF91cyA9IHN0YXRlLnRpbWVzdGFtcF91cztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJ3RlbXBlcmF0dXJlJyBpbiBzdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUudGVtcGVyYXR1cmUgLz0gMTAwLjA7ICAvLyB0ZW1wZXJhdHVyZSBnaXZlbiBpbiBDZWxzaXVzICogMTAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCdwcmVzc3VyZScgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnByZXNzdXJlIC89IDI1Ni4wOyAgLy8gcHJlc3N1cmUgZ2l2ZW4gaW4gKFEyNC44KSBmb3JtYXRcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJvY2Vzc1N0YXRlT3V0cHV0KHN0YXRlKSB7XHJcbiAgICAgICAgICAgIHN0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUpO1xyXG4gICAgICAgICAgICBpZiAoJ3RlbXBlcmF0dXJlJyBpbiBzdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUudGVtcGVyYXR1cmUgKj0gMTAwLjA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCdwcmVzc3VyZScgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnByZXNzdXJlICo9IDI1Ni4wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgc2VyaWFsaXphdGlvbkhhbmRsZXIuJGluamVjdCA9IFsnZGVzY3JpcHRvcnNIYW5kbGVyJ107XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdzZXJpYWxpemF0aW9uSGFuZGxlcicsIHNlcmlhbGl6YXRpb25IYW5kbGVyKTtcclxuXHJcbiAgICBmdW5jdGlvbiBzZXJpYWxpemF0aW9uSGFuZGxlcihkZXNjcmlwdG9yc0hhbmRsZXIpIHtcclxuICAgICAgICB2YXIgaGFuZGxlckNhY2hlID0ge307XHJcblxyXG4gICAgICAgIHZhciBuZXdlc3RWZXJzaW9uID0geyBtYWpvcjogMCwgbWlub3I6IDAsIHBhdGNoOiAwIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGlzTmV3ZXJWZXJzaW9uKHZlcnNpb24pIHtcclxuICAgICAgICAgICAgaWYgKHZlcnNpb24ubWFqb3IgIT09IG5ld2VzdFZlcnNpb24ubWFqb3IpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2ZXJzaW9uLm1ham9yID4gbmV3ZXN0VmVyc2lvbi5tYWpvcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodmVyc2lvbi5taW5vciAhPT0gbmV3ZXN0VmVyc2lvbi5taW5vcikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZlcnNpb24ubWlub3IgPiBuZXdlc3RWZXJzaW9uLm1pbm9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB2ZXJzaW9uLnBhdGNoID4gbmV3ZXN0VmVyc2lvbi5wYXRjaDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHZlcnNpb25Ub1N0cmluZyh2ZXJzaW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2ZXJzaW9uLm1ham9yLnRvU3RyaW5nKCkgKyAnLicgKyB2ZXJzaW9uLm1pbm9yLnRvU3RyaW5nKCkgKyAnLicgKyB2ZXJzaW9uLnBhdGNoLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzdHJpbmdUb1ZlcnNpb24odmVyc2lvbikge1xyXG4gICAgICAgICAgICB2YXIgcGFydHMgPSB2ZXJzaW9uLnNwbGl0KCcuJyk7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBtYWpvcjogcGFyc2VJbnQocGFydHNbMF0pLFxyXG4gICAgICAgICAgICAgICAgbWlub3I6IHBhcnNlSW50KHBhcnRzWzFdKSxcclxuICAgICAgICAgICAgICAgIHBhdGNoOiBwYXJzZUludChwYXJ0c1syXSksXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhZGRIYW5kbGVyKHZlcnNpb24sIHN0cnVjdHVyZSkge1xyXG4gICAgICAgICAgICBpZiAoaXNOZXdlclZlcnNpb24odmVyc2lvbikpIHtcclxuICAgICAgICAgICAgICAgIG5ld2VzdFZlcnNpb24gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFqb3I6IHZlcnNpb24ubWFqb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgbWlub3I6IHZlcnNpb24ubWlub3IsXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0Y2g6IHZlcnNpb24ucGF0Y2gsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGhhbmRsZXJDYWNoZVt2ZXJzaW9uVG9TdHJpbmcodmVyc2lvbildID0gRmx5YnJpeFNlcmlhbGl6YXRpb24ucGFyc2Uoc3RydWN0dXJlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNvcHlIYW5kbGVyKHZlcnNpb24sIHNyY1ZlcnNpb24pIHtcclxuICAgICAgICAgICAgaWYgKGlzTmV3ZXJWZXJzaW9uKHZlcnNpb24pKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdlc3RWZXJzaW9uID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ham9yOiB2ZXJzaW9uLm1ham9yLFxyXG4gICAgICAgICAgICAgICAgICAgIG1pbm9yOiB2ZXJzaW9uLm1pbm9yLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhdGNoOiB2ZXJzaW9uLnBhdGNoLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBoYW5kbGVyQ2FjaGVbdmVyc2lvblRvU3RyaW5nKHZlcnNpb24pXSA9IGhhbmRsZXJDYWNoZVt2ZXJzaW9uVG9TdHJpbmcoc3JjVmVyc2lvbildO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGRlc2NWZXJzaW9ucyA9IGRlc2NyaXB0b3JzSGFuZGxlci52ZXJzaW9ucztcclxuICAgICAgICB2YXIgZGVzY0ZpbGVzID0gZGVzY3JpcHRvcnNIYW5kbGVyLmZpbGVzO1xyXG4gICAgICAgIHZhciBkZXNjUmV2ZXJzZU1hcCA9IHt9O1xyXG4gICAgICAgIE9iamVjdC5rZXlzKGRlc2NWZXJzaW9ucykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgdmFyIHZlcnMgPSBzdHJpbmdUb1ZlcnNpb24oa2V5KTtcclxuICAgICAgICAgICAgdmFyIGZpbGVuYW1lID0gZGVzY1ZlcnNpb25zW2tleV07XHJcbiAgICAgICAgICAgIGlmIChmaWxlbmFtZSBpbiBkZXNjUmV2ZXJzZU1hcCkge1xyXG4gICAgICAgICAgICAgICAgY29weUhhbmRsZXIodmVycywgZGVzY1JldmVyc2VNYXBbZmlsZW5hbWVdKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZmlsZW5hbWUgPSBkZXNjVmVyc2lvbnNba2V5XTtcclxuICAgICAgICAgICAgICAgIGFkZEhhbmRsZXIodmVycywgZGVzY0ZpbGVzW2ZpbGVuYW1lXSk7XHJcbiAgICAgICAgICAgICAgICBkZXNjUmV2ZXJzZU1hcFtmaWxlbmFtZV0gPSB2ZXJzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUZpZWxkcyh0YXJnZXQsIHNvdXJjZSkge1xyXG4gICAgICAgICAgICBpZiAoc291cmNlIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1cGRhdGVGaWVsZHNBcnJheSh0YXJnZXQsIHNvdXJjZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc291cmNlIGluc3RhbmNlb2YgT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdXBkYXRlRmllbGRzT2JqZWN0KHRhcmdldCwgc291cmNlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoc291cmNlID09PSBudWxsIHx8IHNvdXJjZSA9PT0gdW5kZWZpbmVkKSA/IHRhcmdldCA6IHNvdXJjZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlRmllbGRzT2JqZWN0KHRhcmdldCwgc291cmNlKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXModGFyZ2V0KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdXBkYXRlRmllbGRzKHRhcmdldFtrZXldLCBzb3VyY2Vba2V5XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGtleSBpbiByZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHVwZGF0ZUZpZWxkcyh0YXJnZXRba2V5XSwgc291cmNlW2tleV0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUZpZWxkc0FycmF5KHRhcmdldCwgc291cmNlKSB7XHJcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBNYXRoLm1heCh0YXJnZXQubGVuZ3RoLCBzb3VyY2UubGVuZ3RoKTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBsZW5ndGg7ICsraWR4KSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh1cGRhdGVGaWVsZHModGFyZ2V0W2lkeF0sIHNvdXJjZVtpZHhdKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIFNlcmlhbGl6ZXI6IEZseWJyaXhTZXJpYWxpemF0aW9uLlNlcmlhbGl6ZXIsXHJcbiAgICAgICAgICAgIGdldEhhbmRsZXI6IGZ1bmN0aW9uIChmaXJtd2FyZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZXJDYWNoZVtmaXJtd2FyZV07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldE5ld2VzdFZlcnNpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXdlc3RWZXJzaW9uO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhZGRIYW5kbGVyOiBhZGRIYW5kbGVyLFxyXG4gICAgICAgICAgICBjb3B5SGFuZGxlcjogY29weUhhbmRsZXIsXHJcbiAgICAgICAgICAgIHVwZGF0ZUZpZWxkczogdXBkYXRlRmllbGRzLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG59KCkpO1xyXG4iXX0=
