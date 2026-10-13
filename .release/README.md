`latest.json` records the archives built for the immutable release tag. Registry checks normally require those exact integrity values.

The first automated release, `0.1.0`, stopped at npm authentication. Its packages were later published manually with different build output. For example, the tagged Solid bundle is 5,705 bytes; the published bundle is 984 bytes and imports the shared provider implementation. Rebuilding `v0.1.0` reproduces the original recorded integrity.

`initial-publication.json` preserves the original record and separately pins the downloaded npm archives. Reconciliation applies only when the entire original record matches. It does not accept arbitrary registry values, change `v0.1.0`, or apply to subsequent versions.

Future releases must publish the recorded build. If their integrity differs, investigate the archives rather than adding a general bypass.

A successful publication command means npm accepted the submission. Validation can delay public registry availability, so the publication job does not require immediate visibility. Subsequent runs verify the integrity of available packages and resume missing packages at the recorded version. A 404 alone does not distinguish an unsubmitted package from one awaiting npm validation; let validation finish before retrying.
